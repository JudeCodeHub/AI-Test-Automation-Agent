import { GoogleGenAI, Type } from '@google/genai';
import { Page } from 'playwright-core';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export const STEP_RETRIES = 2;
export const STEP_RETRY_DELAY_MS = 500;

export type Step = {
  action: 'goto' | 'click' | 'fill' | 'waitForSelector' | 'wait';
  selector?: string;
  value?: string;
  path?: string;
};

export type Assertion = {
  type: 'visible' | 'text' | 'url';
  selector?: string;
  expected?: string;
};

export type AssertionResult = Assertion & { passed: boolean; error?: string };

export type Script = { steps: Step[]; assertions: Assertion[] };

export function log(runId: string, message: string, extra?: Record<string, unknown>) {
  console.log(`[test-run ${runId}] ${message}`, extra ?? '');
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Runs a step with a couple of retries - real target apps are flaky under
 * cold navigation (hydration, late-mounting selectors), so a single failed
 * click shouldn't fail the whole run. */
export async function runStepWithRetry(page: Page, step: Step, baseUrl: string, runId: string) {
  let lastError: unknown;

  for (let attempt = 0; attempt <= STEP_RETRIES; attempt++) {
    try {
      switch (step.action) {
        case 'goto':
          await page.goto(`${baseUrl}${step.path ?? '/'}`, {
            waitUntil: 'domcontentloaded',
            timeout: 20000,
          });
          return;
        case 'click':
          if (step.selector) await page.click(step.selector, { timeout: 10000 });
          return;
        case 'fill':
          if (step.selector) await page.fill(step.selector, step.value ?? '', { timeout: 10000 });
          return;
        case 'waitForSelector':
          if (step.selector) await page.waitForSelector(step.selector, { timeout: 10000 });
          return;
        case 'wait':
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

/** Scans the currently-loaded page for real interactive elements so script
 * generation can pick selectors that actually exist, instead of guessing a
 * plausible-sounding id/class from the test case description alone. */
export async function extractPageSummary(page: Page): Promise<string> {
  try {
    const elements = await page.evaluate(() => {
      const selectors = [
        'button',
        'a[href]',
        'input',
        'select',
        'textarea',
        '[role="button"]',
        '[data-testid]',
      ];
      const allNodes = Array.from(document.querySelectorAll(selectors.join(',')));

      // Being present in the DOM isn't enough - a responsive nav toggle,
      // closed modal, or off-canvas menu can be real but not currently
      // clickable. Only offer elements a real user could interact with
      // right now, at this viewport, in this state.
      const nodes = allNodes.filter((el) => {
        if ('checkVisibility' in el && typeof (el as any).checkVisibility === 'function') {
          return (el as any).checkVisibility();
        }
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && (el as HTMLElement).offsetParent !== null;
      });

      return nodes.slice(0, 40).map((el) => {
        const tag = el.tagName.toLowerCase();
        // A plain CSS identifier - excludes Tailwind arbitrary-value classes
        // like "z-[110]" or "w-1/2", whose brackets/slashes are special
        // characters in a CSS selector and throw a DOMException if used raw.
        const safeIdentifier = /^-?[a-zA-Z_][a-zA-Z0-9_-]*$/;
        const id = el.id && safeIdentifier.test(el.id) ? `#${el.id}` : '';
        const testId = el.getAttribute('data-testid');
        const classList = typeof el.className === 'string' ? el.className.trim() : '';
        const safeClasses = classList
          ? classList
              .split(/\s+/)
              .filter((c) => safeIdentifier.test(c))
              .slice(0, 2)
          : [];
        const cls = !id && safeClasses.length > 0 ? `.${safeClasses.join('.')}` : '';
        const text = (el.textContent || '').trim().slice(0, 40);
        const type = el.getAttribute('type');
        const placeholder = el.getAttribute('placeholder');
        const href = el.getAttribute('href');

        const parts = [`${tag}${id || cls}`];
        if (testId) parts.push(`[data-testid="${testId}"]`);
        if (type) parts.push(`[type="${type}"]`);
        if (href) parts.push(`[href="${href}"]`);
        if (placeholder) parts.push(`placeholder="${placeholder}"`);
        if (text) parts.push(`text="${text}"`);
        return parts.join(' ');
      });
    });

    return elements.join('\n');
  } catch {
    return '';
  }
}

export async function generateScript({
  title,
  description,
  targetRoute,
  expectedResult,
  customPrompt,
  pageSummary,
}: {
  title: string;
  description: string;
  targetRoute: string | null;
  expectedResult: string | null;
  customPrompt?: string;
  pageSummary?: string;
}): Promise<Script> {
  const prompt = `
You are a Playwright test automation engineer.

Convert this test case into a bounded sequence of browser steps and assertions.
Do not write raw code - return structured JSON only.

Test case:
Title: ${title}
Description: ${description}
Target route: ${targetRoute ?? '/'}
Expected result: ${expectedResult ?? 'N/A'}
${customPrompt ? `\nAdditional run instructions from the user (merge these into the steps/assertions where relevant):\n${customPrompt}\n` : ''}
Real interactive elements found on the live page right now (tag, selector, attributes, visible text):
${pageSummary && pageSummary.length > 0 ? pageSummary : '(none captured - keep steps minimal)'}

Rules:
- "steps" run in order against a real browser page.
- Allowed step actions: goto, click, fill, waitForSelector, wait.
- "goto" uses "path" (relative route, e.g. "/dashboard").
- "click" and "waitForSelector" use "selector" (a CSS selector).
- "fill" uses "selector" and "value".
- "wait" uses "value" as milliseconds (as a string number).
- Keep it to 3-8 steps max.
- Only use "#id" or ".class" selectors that literally appear in the element list above.
  Never invent a selector that isn't listed. If nothing relevant is listed, skip
  selector-based steps entirely and rely on "wait" and a "url" assertion instead.
- Never use a selector containing "[", "]", "/", "(", ")", "%", or ":" (e.g. a
  Tailwind arbitrary-value class like "z-[110]") - those are invalid as a raw CSS
  selector and will crash. The element list above never contains one.
- "assertions" run after steps to decide pass/fail.
- Allowed assertion types: visible (selector), text (selector + expected substring), url (expected substring of the URL).
- Assertion selectors must also come only from the element list above.
- Include at least one assertion.
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
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
                  enum: ['goto', 'click', 'fill', 'waitForSelector', 'wait'],
                },
                selector: { type: Type.STRING },
                value: { type: Type.STRING },
                path: { type: Type.STRING },
              },
              required: ['action'],
            },
          },
          assertions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ['visible', 'text', 'url'] },
                selector: { type: Type.STRING },
                expected: { type: Type.STRING },
              },
              required: ['type'],
            },
          },
        },
        required: ['steps', 'assertions'],
      },
    },
  });

  const parsed = JSON.parse(response.text || '{}');
  return {
    steps: (parsed.steps ?? []) as Step[],
    assertions: (parsed.assertions ?? []) as Assertion[],
  };
}

export async function runAssertions(
  page: Page,
  assertions: Assertion[]
): Promise<{
  passed: boolean;
  results: AssertionResult[];
}> {
  const results: AssertionResult[] = [];
  let passed = true;

  for (const assertion of assertions) {
    try {
      if (assertion.type === 'visible' && assertion.selector) {
        await page.waitForSelector(assertion.selector, { state: 'visible', timeout: 8000 });
        results.push({ ...assertion, passed: true });
      } else if (assertion.type === 'text' && assertion.selector) {
        const content = await page.textContent(assertion.selector);
        const ok = !!content && content.includes(assertion.expected ?? '');
        if (!ok) passed = false;
        results.push({ ...assertion, passed: ok });
      } else if (assertion.type === 'url') {
        const ok = page.url().includes(assertion.expected ?? '');
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

export { scriptToPseudocode } from './scriptPseudocode';
