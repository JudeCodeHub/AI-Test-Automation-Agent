import Browserbase from '@browserbasehq/sdk';

export const browserbase = new Browserbase({
  apiKey: process.env.BROWSERBASE_API_KEY!,
});

export const BROWSERBASE_PROJECT_ID = process.env.BROWSERBASE_PROJECT_ID!;

export function sessionReplayUrl(sessionId: string) {
  return `https://browserbase.com/sessions/${sessionId}`;
}
