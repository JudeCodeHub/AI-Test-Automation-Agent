import type { Script } from "./testRunner";

/** Renders the structured script as readable Playwright-style pseudocode for
 * display only. Execution always runs the structured Step[]/Assertion[]
 * directly - this is never eval'd, so it stays safe against AI-generated
 * code even if a prompt-injected repo file tried to smuggle something in.
 * No server-only imports here, so it's safe to use from client components too. */
export function scriptToPseudocode(script: Script, targetRoute: string | null): string {
  const lines: string[] = [];
  lines.push(`await page.goto('${targetRoute ?? "/"}');`);

  for (const step of script.steps) {
    switch (step.action) {
      case "goto":
        lines.push(`await page.goto('${step.path ?? "/"}');`);
        break;
      case "click":
        lines.push(`await page.click('${step.selector}');`);
        break;
      case "fill":
        lines.push(`await page.fill('${step.selector}', '${step.value ?? ""}');`);
        break;
      case "waitForSelector":
        lines.push(`await page.waitForSelector('${step.selector}');`);
        break;
      case "wait":
        lines.push(`await page.waitForTimeout(${Number(step.value) || 1000});`);
        break;
    }
  }

  for (const assertion of script.assertions) {
    if (assertion.type === "visible") {
      lines.push(`await expect(page.locator('${assertion.selector}')).toBeVisible();`);
    } else if (assertion.type === "text") {
      lines.push(`await expect(page.locator('${assertion.selector}')).toContainText('${assertion.expected}');`);
    } else if (assertion.type === "url") {
      lines.push(`await expect(page).toHaveURL(/${assertion.expected}/);`);
    }
  }

  return lines.join("\n");
}
