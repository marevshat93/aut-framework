import { test as base, expect  } from '@playwright/test';
import { Logger } from './logger';
import { step, TestStepResult } from './step';
import { Expect } from '@playwright/test';

export interface FrameworkTestFixtures {
  logger: Logger;
  testSteps: TestStepResult[];
}

export const test = base.extend<FrameworkTestFixtures>({
  logger: async ({}, use, testInfo) => {
    const logger = new Logger(testInfo.title);
    await use(logger);

    // Attach logs to the test for the HTML reporter
    testInfo.attach('framework-logs', {
      body: JSON.stringify(logger.getLogs(), null, 2),
      contentType: 'application/json',
    });
  },

  testSteps: async ({}, use, testInfo) => {
    const steps: TestStepResult[] = [];
    await use(steps);

    testInfo.attach('test-steps', {
      body: JSON.stringify(steps, null, 2),
      contentType: 'application/json',
    });
  },
});

export type ExpectWithMessage = {
  <T>(actual: T, message?: string): ReturnType<Expect>
} & Omit<Expect, never>

export function createExpect(logger: Logger): ExpectWithMessage {
  const wrapped = ((actual: unknown, message?: string) => {
    if (message) {
      logger.info(`EXPECT: ${message}`)
    }
    return expect(actual)
  }) as ExpectWithMessage

  // copy static properties: soft, poll, extend, etc.
  Object.assign(wrapped, expect)

  return wrapped
}

export { expect, step, Logger };

