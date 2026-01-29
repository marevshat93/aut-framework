import type { FullConfig, Suite, TestCase, TestResult, FullResult } from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';
import stripAnsi from 'strip-ansi';

interface SerializableAttachment {
  name: string;
  contentType: string;
  body?: string;
}

function escapeHtml(value: string): string {
  const clean = stripAnsi(value)

  return clean
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export default class HtmlReporter {
  private outputFile!: string;
  private outputDir!: string;
  private rootSuite!: Suite;

  onBegin(config: FullConfig, suite: Suite): void {
    this.rootSuite = suite;
    const options = (config as unknown as { reporterOptions?: { outputDir?: string } }).reporterOptions || {};
    this.outputDir = options.outputDir || 'playwright-report';
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    this.outputFile = path.join(this.outputDir, 'index.html');
  }

  async onEnd(result: FullResult): Promise<void> {
    const status = result.status?.toUpperCase?.() ?? 'COMPLETED';
    const html = this.buildHtml(this.rootSuite, status);
    fs.writeFileSync(this.outputFile, html, 'utf-8');

    // Save console logs to a separate file
    this.saveConsoleLogs(this.rootSuite);
  }

  // The methods below remain as a more detailed implementation example and can be
  // wired to the current Playwright reporter lifecycle if desired.
  private buildHtml(rootSuite: Suite, status: string): string {
    const suitesHtml = this.renderSuite(rootSuite, 'suite-root');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Playwright API Test Report</title>
  <style>
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 0; background: #0f172a; color: #e5e7eb; }
    header { padding: 1rem 2rem; background: #111827; border-bottom: 1px solid #1f2937; display: flex; justify-content: space-between; align-items: center; }
    h1 { margin: 0; font-size: 1.4rem; }
    .summary { font-size: 0.9rem; color: #9ca3af; }
    .container { padding: 1rem 2rem 2rem; }
    details { border-radius: 0.5rem; background: #020617; margin-bottom: 0.5rem; border: 1px solid #1f2937; }
    summary { cursor: pointer; padding: 0.6rem 0.9rem; font-weight: 500; display: flex; justify-content: space-between; align-items: center; }
    summary::-webkit-details-marker { display: none; }
    .badge { padding: 0.15rem 0.55rem; border-radius: 999px; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; }
    .passed { background: #022c22; color: #6ee7b7; border: 1px solid #16a34a; }
    .failed { background: #450a0a; color: #fecaca; border: 1px solid #dc2626; }
    .skipped { background: #1f2937; color: #e5e7eb; border: 1px solid #4b5563; }
    .suite { border-left: 3px solid #1d4ed8; }
    .test { border-left: 3px solid #6b21a8; }
    .steps { border-left: 3px solid #16a34a; margin-left: 0.9rem; }
    .logs { border-left: 3px solid #eab308; margin-left: 0.9rem; }
    .stack { border-left: 3px solid #dc2626; margin-left: 0.9rem; }
    .section-title { font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.06em; color: #9ca3af; margin-bottom: 0.25rem; }
    .log-entry { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size: 0.78rem; padding: 0.25rem 0.5rem; border-radius: 0.25rem; margin-bottom: 0.15rem; }
    .log-debug { background: #020617; color: #6b7280; }
    .log-info { background: #020617; color: #e5e7eb; }
    .log-warn { background: #422006; color: #facc15; }
    .log-error { background: #450a0a; color: #fecaca; }
    pre { white-space: pre-wrap; word-break: break-word; background: #020617; padding: 0.5rem 0.75rem; border-radius: 0.35rem; border: 1px solid #1f2937; font-size: 0.78rem; }
    code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>Playwright API Test Report</h1>
    <div class="summary">Status: ${status}</div>
    </div>
    <div class="summary">${new Date().toLocaleString()}</div>
  </header>
  <div class="container">
    ${suitesHtml}
  </div>
</body>
</html>`;
  }

  private renderSuite(suite: Suite, idPrefix: string): string {
    const suiteId = `${idPrefix}-${suite.title || 'root'}`.replace(/\s+/g, '-').toLowerCase();
    const testsHtml = suite.tests.map((t, i) => this.renderTest(t, `${suiteId}-test-${i}`)).join('\n');
    const childSuitesHtml = suite.suites.map((s, i) => this.renderSuite(s, `${suiteId}-child-${i}`)).join('\n');

    // Skip rendering empty/unnamed suites that are just structural (no title, no direct tests)
    // These are typically intermediate suites created by Playwright's file structure
    if (!suite.title && suite.tests.length === 0) {
      // Just return children directly without a wrapper
      return childSuitesHtml;
    }

    return `
<details class="suite" open>
  <summary>
    <span>${suite.title || 'Root Suite'}</span>
  </summary>
  <div style="padding: 0 0.9rem 0.75rem;">
    ${testsHtml}
    ${childSuitesHtml}
  </div>
</details>`;
  }

  private renderTest(test: TestCase, idPrefix: string): string {
    const results = test.results;
    const lastResult: TestResult | undefined = results[results.length - 1];
    const status = lastResult?.status ?? 'skipped';
    const badgeClass = status === 'passed' ? 'passed' : status === 'failed' ? 'failed' : 'skipped';
    const stepsAttachment = this.findAttachment(lastResult, 'test-steps');
    const logsAttachment = this.findAttachment(lastResult, 'framework-logs');

    const steps = stepsAttachment ? this.safeJsonParse(stepsAttachment.body || '[]', []) : [];
    const logs = logsAttachment ? this.safeJsonParse(logsAttachment.body || '[]', []) : [];

    const stepsHtml = steps
      .map(
        (s: any) => `
        <div class="log-entry ${s.status === 'passed' ? 'log-info' : 'log-error'}">
          <strong>${escapeHtml(s.name)}</strong> - ${s.status.toUpperCase()}
          <div style="font-size:0.7rem; color:#9ca3af;">${s.startedAt} → ${s.endedAt}</div>
          ${s.error ? `<div>${escapeHtml(s.error)}</div>` : ''}
        </div>`,
      )
      .join('');

    const logsHtml = logs
      .map(
        (l: any) => `
        <div class="log-entry log-${escapeHtml(l.level || 'info')}">
          <span style="opacity:0.7;">${escapeHtml(l.timestamp || '')}</span>
          <span> [${(l.level || '').toString().toUpperCase()}]</span>
          <span> ${escapeHtml(l.message || '')}</span>
        </div>`,
      )
      .join('');

    const errorStack = lastResult?.error?.stack || '';

    return `
<details class="test" open>
  <summary>
    <span>${escapeHtml(test.title)}</span>
    <span class="badge ${badgeClass}">${status.toUpperCase()}</span>
  </summary>
  <div style="padding: 0 0.9rem 0.75rem;">
    <details class="steps" open>
      <summary><span class="section-title">Test Steps</span></summary>
      <div style="padding: 0.25rem 0.5rem 0.5rem;">
        ${stepsHtml || '<div style="font-size:0.8rem; color:#6b7280;">No steps captured.</div>'}
      </div>
    </details>

    <details class="logs">
      <summary><span class="section-title">Logs</span></summary>
      <div style="padding: 0.25rem 0.5rem 0.5rem;">
        ${logsHtml || '<div style="font-size:0.8rem; color:#6b7280;">No logs captured.</div>'}
      </div>
    </details>

    ${
      errorStack
        ? `<details class="stack" open>
      <summary><span class="section-title">Stack Trace</span></summary>
      <pre><code>${escapeHtml(errorStack)}</code></pre>
    </details>`
        : ''
    }
  </div>
</details>`;
  }

  private findAttachment(result: TestResult | undefined, name: string): SerializableAttachment | undefined {
    if (!result) return undefined;
    const attachment = result.attachments.find(a => a.name === name);
    if (!attachment || !attachment.body) return undefined;
    const body = attachment.body.toString('utf-8');
    return {
      name: attachment.name,
      contentType: attachment.contentType,
      body,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private safeJsonParse<T = any>(value: string, fallback: T): T {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }

  /**
   * Collect all console logs from all test results and save to a file.
   */
  private saveConsoleLogs(suite: Suite): void {
    const consoleLogs: string[] = [];
    const timestamp = new Date().toISOString();

    consoleLogs.push(`=== Console Log Output ===`);
    consoleLogs.push(`Test Run Completed: ${timestamp}`);
    consoleLogs.push(`\n`);

    // Collect console logs from all tests
    this.collectConsoleLogsFromSuite(suite, consoleLogs);

    // Write to file
    const consoleLogFile = path.join(this.outputDir, 'console.log');
    const logContent = consoleLogs.join('\n');
    fs.writeFileSync(consoleLogFile, logContent, 'utf-8');
  }

  /**
   * Recursively collect console logs from a suite and all its children.
   */
  private collectConsoleLogsFromSuite(suite: Suite, logs: string[]): void {
    // Process tests in this suite
    for (const test of suite.tests) {
      if (test.results.length === 0) continue;

      logs.push(`\n[${test.title}]`);
      logs.push(`${'='.repeat(80)}`);

      for (const result of test.results) {
        // Add stdout (console.log, console.info, etc.)
        if (result.stdout && result.stdout.length > 0) {
          logs.push(`\n--- STDOUT ---`);
          for (const entry of result.stdout) {
            const text = typeof entry === 'string' ? entry : entry.toString('utf-8');
            const cleanText = stripAnsi(text);
            if (cleanText.trim()) {
              logs.push(cleanText);
            }
          }
        }

        // Add stderr (console.error, console.warn, etc.)
        if (result.stderr && result.stderr.length > 0) {
          logs.push(`\n--- STDERR ---`);
          for (const entry of result.stderr) {
            const text = typeof entry === 'string' ? entry : entry.toString('utf-8');
            const cleanText = stripAnsi(text);
            if (cleanText.trim()) {
              logs.push(cleanText);
            }
          }
        }
      }

      logs.push(`\n`);
    }

    // Recursively process child suites
    for (const childSuite of suite.suites) {
      this.collectConsoleLogsFromSuite(childSuite, logs);
    }
  }
}

