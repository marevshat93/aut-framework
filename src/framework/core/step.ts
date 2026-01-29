import { Logger } from './logger';

export interface TestStepResult {
  name: string;
  status: 'passed' | 'failed';
  error?: string;
  startedAt: string;
  endedAt: string;
}

/**
 * Utility to execute a named test step with consistent logging and error handling.
 * This is framework-agnostic and can be reused for API and UI tests.
 */
export async function step<T>(
  logger: Logger,
  testSteps: TestStepResult[],
  description: string,
  fn: () => Promise<T> | T,
): Promise<T> {
  const startedAt = new Date().toISOString();
  logger.info(`STEP START: ${description}`);

  try {
    const result = await fn();
    const stepResult: TestStepResult = {
      name: description,
      status: 'passed',
      startedAt,
      endedAt: new Date().toISOString(),
    };
    testSteps.push(stepResult);
    logger.info(`STEP PASS: ${description}`);
    return result;
  } catch (err) {
    const message =
      err instanceof Error
        ? `${err.message}`
        : typeof err === 'string'
        ? err
        : 'Unknown error during step execution';

    const stepResult: TestStepResult = {
      name: description,
      status: 'failed',
      error: message,
      startedAt,
      endedAt: new Date().toISOString(),
    };
    testSteps.push(stepResult);

    logger.error(`STEP FAIL: ${description} - ${message}`, err as Error);
    throw Object.assign(err instanceof Error ? err : new Error(message), {
      _stepResult: stepResult,
    });
  }
}

