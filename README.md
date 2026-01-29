# Playwright + TypeScript API Test Framework

A production-ready API automation framework built with Playwright and TypeScript, featuring extensible architecture, comprehensive logging, and custom HTML reporting.

## Installation & Run

### Prerequisites
- Node.js (v16 or higher)
- npm

### Install Dependencies

```bash
npm install
```

### Run Tests

```bash
# Compile TypeScript and run all tests
npm test

# Run tests and automatically open the HTML report
npm run test:report

# Run tests in watch mode with UI
npm run test:watch
```

The `npm test` command automatically compiles TypeScript from `src/` to `dist/` before executing tests.

## How to View Test Results

After running tests, view the results in several ways:

### HTML Report
The custom HTML report is generated in the `playwright-report/` directory:

```bash
# Open the HTML report
npx playwright show-report
```

Or open `playwright-report/index.html` directly in your browser.

The HTML report includes:
- **Test suites and cases** with pass/fail status
- **Test steps** with timing information
- **Detailed logs** from framework logging
- **Stack traces** for failed tests
- **Console output** saved to `playwright-report/console.log`

### Console Output
All console logs are saved to a separate file:
- `playwright-report/console.log` - Contains all stdout/stderr from test execution

## Design Decisions & Tradeoffs

**OOP-Based Architecture with Composition**: The framework uses an abstract `BaseApiClient` class that encapsulates common HTTP logic (request building, error handling, status code tracking) while allowing concrete clients to specialize for specific APIs. This design promotes code reuse and maintainability, but requires upfront abstraction design. The tradeoff is slightly more initial complexity compared to functional approaches, but pays dividends as the test suite grows and new APIs are added.
Similarly for pposible future UI testing the framework uses an abstract `BasePage` class that embodies the principle of Page Object Model and provides the user with the starting kit of useful functions already integrated with the logger.

**Structured Logging with Step Tracking**: Every test action is wrapped in a `step()` utility that captures timing, status, and contextual information. Logs are stored in-memory during test execution and attached to test results for HTML reporting. This provides excellent debugging capabilities and audit trails, but increases memory usage for long-running test suites. The decision to use in-memory storage rather than streaming to files was made to ensure atomic test reporting and simpler error handling.

**Custom HTML Reporter vs. Built-in Options**: A custom HTML reporter was built to provide step-level granularity and integrated framework logs, which standard Playwright reporters don't offer out-of-the-box. This gives complete control over report structure and styling, but requires maintenance as Playwright evolves. The reporter also saves console logs separately, providing both structured (HTML) and unstructured (console.log) views of test execution for different debugging needs.
