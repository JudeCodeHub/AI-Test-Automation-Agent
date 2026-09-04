import { NextRequest, NextResponse } from "next/server";
import { chromium } from "playwright-core";
import { db } from "@/db";
import { TestCasesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { browserbase, BROWSERBASE_PROJECT_ID, sessionReplayUrl } from "@/lib/browserbase";
import { extractPageSummary, generateScript, runAssertions, runStepWithRetry, Script, scriptToPseudocode } from "@/lib/testRunner";

export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  const logs: string[] = [];
  let browser: Awaited<ReturnType<typeof chromium.connectOverCDP>> | null = null;
  let testCaseId: number | undefined;

  try {
    const body = await req.json();
    testCaseId = body.testCaseId;
    const baseUrlInput: string | undefined = body.baseUrl;
    const mode: "cache" | "generate" = body.mode === "generate" ? "generate" : "cache";
    const customPrompt: string | undefined = body.customPrompt || undefined;

    if (!testCaseId || !baseUrlInput) {
      return NextResponse.json({ error: "testCaseId and baseUrl are required" }, { status: 400 });
    }

    const [testCase] = await db
      .select()
      .from(TestCasesTable)
      .where(eq(TestCasesTable.id, testCaseId));

    if (!testCase) {
      return NextResponse.json({ error: "Test case not found" }, { status: 404 });
    }

    if (testCase.status === "running") {
      return NextResponse.json({ error: "This test case is already running" }, { status: 409 });
    }

    await db.update(TestCasesTable).set({ status: "running" }).where(eq(TestCasesTable.id, testCaseId));

    const useCache = mode === "cache" && !!testCase.browserbaseScript;

    logs.push("[SYSTEM] Creating Browserbase session...");
    const session = await browserbase.sessions.create({ projectId: BROWSERBASE_PROJECT_ID });
    logs.push(`[SYSTEM] Session created: ${session.id}`);

    browser = await chromium.connectOverCDP(session.connectUrl);
    const context = browser.contexts()[0] ?? (await browser.newContext());
    const page = context.pages()[0] ?? (await context.newPage());

    const baseUrl = baseUrlInput.replace(/\/$/, "");

    logs.push(`[BROWSER] Navigating to ${baseUrl}${testCase.targetRoute ?? "/"}`);
    await runStepWithRetry(page, { action: "goto", path: testCase.targetRoute ?? "/" }, baseUrl, session.id);

    let script: Script;
    if (useCache) {
      logs.push("[SYSTEM] Using cached script from a previous run.");
      script = JSON.parse(testCase.browserbaseScript as string);
    } else {
      logs.push("[SYSTEM] Scanning the loaded page for real elements...");
      const pageSummary = await extractPageSummary(page);
      logs.push("[SYSTEM] Asking Gemini to generate a script grounded in the real page...");
      script = await generateScript({
        title: testCase.title,
        description: testCase.description,
        targetRoute: testCase.targetRoute,
        expectedResult: testCase.expectedResult,
        customPrompt,
        pageSummary,
      });
      logs.push(`[SYSTEM] Script ready - ${script.steps.length} steps, ${script.assertions.length} assertions.`);
    }

    for (const step of script.steps) {
      logs.push(`[BROWSER] ${step.action}${step.selector ? ` ${step.selector}` : ""}${step.path ? ` ${step.path}` : ""}`);
      await runStepWithRetry(page, step, baseUrl, session.id);
    }

    logs.push("[SYSTEM] Running assertions...");
    const { passed, results: assertionResults } = await runAssertions(page, script.assertions);
    assertionResults.forEach((result) => {
      logs.push(`[SYSTEM] ${result.passed ? "PASS" : "FAIL"} - ${result.type} ${result.selector ?? result.expected ?? ""}`);
    });

    const screenshotBuffer = await page.screenshot();
    const screenshot = screenshotBuffer.toString("base64");

    const durationMs = Date.now() - startedAt;
    logs.push(`[SYSTEM] Run ${passed ? "PASSED" : "FAILED"} in ${durationMs}ms.`);

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

    return NextResponse.json({
      status: passed ? "passed" : "failed",
      logs,
      browserbaseScript: scriptToPseudocode(script, testCase.targetRoute),
      sessionId: session.id,
      sessionUrl: sessionReplayUrl(session.id),
      durationMs,
      screenshot,
    });
  } catch (error: any) {
    logs.push(`[SYSTEM ERROR] ${error.message}`);

    if (testCaseId) {
      await db
        .update(TestCasesTable)
        .set({ status: "failed", lastRunAt: new Date() })
        .where(eq(TestCasesTable.id, testCaseId))
        .catch(() => {});
    }

    return NextResponse.json({ error: error.message || "Failed to run test case", logs }, { status: 500 });
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}
