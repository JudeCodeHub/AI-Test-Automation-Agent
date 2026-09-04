import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { chromium, Page } from "playwright-core";
import { db } from "@/db";
import { TestCasesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { browserbase, BROWSERBASE_PROJECT_ID, sessionReplayUrl } from "@/lib/browserbase";
import { randomUUID } from "crypto";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const STEP_RETRIES = 2;
const STEP_RETRY_DELAY_MS = 500;

type Step = {
  action: "goto" | "click" | "fill" | "waitForSelector" | "wait";
  selector?: string;
  value?: string;
  path?: string;
};

type Assertion = {
  type: "visible" | "text" | "url";
  selector?: string;
  expected?: string;
};

type AssertionResult = Assertion & { passed: boolean; error?: string };

function log(runId: string, message: string, extra?: Record<string, unknown>) {
  console.log(`[test-run ${runId}] ${message}`, extra ?? "");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Runs a step with a couple of retries - real target apps are flaky under
 * cold navigation (hydration, late-mounting selectors), so a single failed
 * click shouldn't fail the whole run. */
async function runStepWithRetry(page: Page, step: Step, baseUrl: string, runId: string) {
  let lastError: unknown;

  for (let attempt = 0; attempt <= STEP_RETRIES; attempt++) {
    try {
      switch (step.action) {
        case "goto":
          await page.goto(`${baseUrl}${step.path ?? "/"}`, {
            waitUntil: "domcontentloaded",
            timeout: 20000,
          });
          return;
        case "click":
          if (step.selector) await page.click(step.selector, { timeout: 10000 });
          return;
        case "fill":
          if (step.selector) await page.fill(step.selector, step.value ?? "", { timeout: 10000 });
          return;
        case "waitForSelector":
          if (step.selector) await page.waitForSelector(step.selector, { timeout: 10000 });
          return;
        case "wait":
          await page.waitForTimeout(Number(step.value) || 1000);
          return;
      }
      return;
    } catch (error) {
      lastError = error;
      if (attempt < STEP_RETRIES) {
        log(runId, `step "${step.action}" failed, retrying (${attempt + 1}/${STEP_RETRIES})`, {
          selector: step.selector,
        });
        await sleep(STEP_RETRY_DELAY_MS);
      }
    }
  }

  throw lastError;
}

async function generateScript({
  title,
  description,
  targetRoute,
  expectedResult,
}: {
  title: string;
  description: string;
  targetRoute: string | null;
  expectedResult: string | null;
}) {
  const prompt = `
You are a Playwright test automation engineer.

Convert this test case into a bounded sequence of browser steps and assertions.
Do not write raw code - return structured JSON only.

Test case:
Title: ${title}
Description: ${description}
Target route: ${targetRoute ?? "/"}
Expected result: ${expectedResult ?? "N/A"}

Rules:
- "steps" run in order against a real browser page.
- Allowed step actions: goto, click, fill, waitForSelector, wait.
- "goto" uses "path" (relative route, e.g. "/dashboard").
- "click" and "waitForSelector" use "selector" (a CSS selector).
- "fill" uses "selector" and "value".
- "wait" uses "value" as milliseconds (as a string number).
- Keep it to 3-8 steps max.
- "assertions" run after steps to decide pass/fail.
- Allowed assertion types: visible (selector), text (selector + expected substring), url (expected substring of the URL).
- Include at least one assertion.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                action: {
                  type: Type.STRING,
                  enum: ["goto", "click", "fill", "waitForSelector", "wait"],
                },
                selector: { type: Type.STRING },
                value: { type: Type.STRING },
                path: { type: Type.STRING },
              },
              required: ["action"],
            },
          },
          assertions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ["visible", "text", "url"] },
                selector: { type: Type.STRING },
                expected: { type: Type.STRING },
              },
              required: ["type"],
            },
          },
        },
        required: ["steps", "assertions"],
      },
    },
  });

  const parsed = JSON.parse(response.text || "{}");
  return {
    steps: (parsed.steps ?? []) as Step[],
    assertions: (parsed.assertions ?? []) as Assertion[],
  };
}

async function runAssertions(page: Page, assertions: Assertion[]): Promise<{
  passed: boolean;
  results: AssertionResult[];
}> {
  const results: AssertionResult[] = [];
  let passed = true;

  for (const assertion of assertions) {
    try {
      if (assertion.type === "visible" && assertion.selector) {
        await page.waitForSelector(assertion.selector, { state: "visible", timeout: 8000 });
        results.push({ ...assertion, passed: true });
      } else if (assertion.type === "text" && assertion.selector) {
        const content = await page.textContent(assertion.selector);
        const ok = !!content && content.includes(assertion.expected ?? "");
        if (!ok) passed = false;
        results.push({ ...assertion, passed: ok });
      } else if (assertion.type === "url") {
        const ok = page.url().includes(assertion.expected ?? "");
        if (!ok) passed = false;
        results.push({ ...assertion, passed: ok });
      }
    } catch (e: any) {
      passed = false;
      results.push({ ...assertion, passed: false, error: e.message });
    }
  }

  return { passed, results };
}

export async function POST(req: NextRequest) {
  const runId = randomUUID();
  const startedAt = Date.now();
  let browser: Awaited<ReturnType<typeof chromium.connectOverCDP>> | null = null;
  let testCaseId: number | undefined;

  try {
    const body = await req.json();
    testCaseId = body.testCaseId;
    const targetDomain: string | undefined = body.targetDomain;

    if (!testCaseId || !targetDomain) {
      return NextResponse.json(
        { error: "testCaseId and targetDomain are required" },
        { status: 400 }
      );
    }

    const [testCase] = await db
      .select()
      .from(TestCasesTable)
      .where(eq(TestCasesTable.id, testCaseId));

    if (!testCase) {
      return NextResponse.json({ error: "Test case not found" }, { status: 404 });
    }

    // Concurrency guard: a test case already mid-run can't be started twice.
    if (testCase.status === "running") {
      return NextResponse.json(
        { error: "This test case is already running" },
        { status: 409 }
      );
    }

    log(runId, "starting run", { testCaseId, title: testCase.title });

    await db
      .update(TestCasesTable)
      .set({ status: "running" })
      .where(eq(TestCasesTable.id, testCaseId));

    const script = testCase.browserbaseScript
      ? (JSON.parse(testCase.browserbaseScript) as { steps: Step[]; assertions: Assertion[] })
      : await generateScript({
          title: testCase.title,
          description: testCase.description,
          targetRoute: testCase.targetRoute,
          expectedResult: testCase.expectedResult,
        });

    const session = await browserbase.sessions.create({ projectId: BROWSERBASE_PROJECT_ID });
    log(runId, "browserbase session created", { sessionId: session.id });

    browser = await chromium.connectOverCDP(session.connectUrl);
    const context = browser.contexts()[0] ?? (await browser.newContext());
    const page = context.pages()[0] ?? (await context.newPage());

    const baseUrl = targetDomain.replace(/\/$/, "");

    await page.goto(
      testCase.targetRoute ? `${baseUrl}${testCase.targetRoute}` : baseUrl,
      { waitUntil: "domcontentloaded", timeout: 20000 }
    );

    for (const step of script.steps) {
      await runStepWithRetry(page, step, baseUrl, runId);
    }

    const { passed, results: assertionResults } = await runAssertions(page, script.assertions);

    const screenshotBuffer = await page.screenshot();
    const screenshot = screenshotBuffer.toString("base64");

    const durationMs = Date.now() - startedAt;

    await db
      .update(TestCasesTable)
      .set({
        status: passed ? "passed" : "failed",
        browserbaseScript: JSON.stringify(script),
        lastRunAt: new Date(),
        lastRunSessionId: session.id,
        lastRunDurationMs: durationMs,
        lastRunAssertions: assertionResults,
      })
      .where(eq(TestCasesTable.id, testCaseId));

    log(runId, `run finished: ${passed ? "passed" : "failed"}`, { durationMs });

    return NextResponse.json({
      success: true,
      status: passed ? "passed" : "failed",
      assertionResults,
      screenshot,
      durationMs,
      sessionReplayUrl: sessionReplayUrl(session.id),
    });
  } catch (error: any) {
    log(runId, "run errored", { message: error.message });

    if (testCaseId) {
      await db
        .update(TestCasesTable)
        .set({ status: "failed", lastRunAt: new Date() })
        .where(eq(TestCasesTable.id, testCaseId))
        .catch(() => {});
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to run test case" },
      { status: 500 }
    );
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}
