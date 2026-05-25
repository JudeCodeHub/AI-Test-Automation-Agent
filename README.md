AI Test Automation Agent
========================

# AI Test Automation Agent

 A concise description: Next.js app that analyzes GitHub repositories and generates AI-suggested test cases.

## Purpose

 Provide developers a fast way to generate and manage AI-generated test cases for their repositories.

## Tech stack

- Next.js + React + TypeScript
- Tailwind CSS
- Drizzle ORM (Neon/Postgres)
- Clerk (authentication)
- Stripe (payments)
- Google Gemini / GenAI (test generation)

## Quick start

 1. Install dependencies:

 ```bash
 npm install
 ```

 1. Create a `.env` file (see the repo's `.env` for examples) and set required keys: `DATABASE_URL`, Clerk keys, `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET`/`GITHUB_REDIRECT_URI`, `GEMINI_API_KEY`, Stripe keys.

 2. Run the dev server:

 ```bash
 npm run dev
 ```

 Open <http://localhost:3000> and sign in to use the app.

 ---

 If you want this expanded again (examples, API routes, deployment), tell me and I'll add it back.
