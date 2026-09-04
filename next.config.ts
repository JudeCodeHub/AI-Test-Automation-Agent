import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Next's build-time file tracer only bundles files it can see via static
  // require/import - playwright-core loads browsers.json dynamically at
  // runtime, so the tracer misses it and Vercel's deployed function ends up
  // missing the file (works locally since the full node_modules is on disk
  // there). Force-include the whole package for the route that uses it.
  outputFileTracingIncludes: {
    '/api/test-cases/run': ['./node_modules/playwright-core/**/*'],
  },
};

export default nextConfig;
