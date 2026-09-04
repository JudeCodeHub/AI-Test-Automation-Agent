# EdgeCase

AI-powered test automation for your GitHub repositories. Connect a repo, let AI read your code and draft real test cases, then run them in an actual browser and see pass/fail results with a recorded replay — no test-writing required.

## What is this project?

EdgeCase connects to your GitHub account, analyzes a repository's source code with Google Gemini, and generates a set of concrete test cases (UI, auth, API, form, integration, edge-case) tailored to that codebase. Each test case can then be executed for real: EdgeCase spins up a live browser session via Browserbase, converts the test case into a Playwright automation script, runs it against your deployed app, checks the assertions, and reports whether it passed or failed — along with a video recording of the run and a screenshot.

It's built for developers who want test coverage without hand-writing test scripts.

## Features

- **GitHub integration** — sign in with GitHub and pick any repository you have access to.
- **AI-generated test cases** — Gemini reads your repo's source files and proposes realistic test cases with a title, description, type, priority, target route, and expected result.
- **Real browser execution** — test cases run in an actual cloud browser (Browserbase + Playwright), not a simulation. Steps and assertions are grounded in the real, currently-visible elements on the page.
- **Pass/fail results with recordings** — every run returns live console logs, a pass/fail verdict, a screenshot, and an embedded video recording of the session — shareable with anyone, no Browserbase account needed.
- **Script caching** — re-run a test case using its previously generated script, or regenerate a fresh one with an optional custom prompt.
- **Credits system** — generating test cases and running them each cost credits, deducted atomically so concurrent requests can't race the balance.

## Tech stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Auth:** Clerk
- **Database:** Postgres (Neon) via Drizzle ORM
- **AI:** Google Gemini (`@google/genai`) for repo analysis and test script generation
- **Browser automation:** Browserbase + Playwright (`playwright-core`) for real, cloud-hosted test execution
- **Payments:** Stripe (billing scaffolding, optional)

## Environment variables

Create a `.env` file in the project root with the following:

```bash
# Database (Neon Postgres)
DATABASE_URL=

# Clerk authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# GitHub OAuth App
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_REDIRECT_URI=http://localhost:3000/api/github/callback

# Google Gemini
GEMINI_API_KEY=

# Browserbase
BROWSERBASE_API_KEY=
BROWSERBASE_PROJECT_ID=

# App URL (used for redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe (optional — app runs fine without these, billing routes are disabled)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

## How to run locally

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up your environment variables** — copy the block above into a `.env` file and fill in your own keys.

3. **Push the database schema**

   ```bash
   npm run db:push
   ```

4. **Start the dev server**

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000), sign in, connect your GitHub account, and pick a repository to start generating and running test cases.
