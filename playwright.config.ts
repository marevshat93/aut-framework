import { defineConfig } from '@playwright/test';

export default defineConfig({
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  testDir: './dist/tests',
  reporter: [['line'], ['./dist/framework/reporting/HtmlReporter.js']],
  use: {
    // Shared settings for all tests (API only for now)
    baseURL: '',
  },
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
});

