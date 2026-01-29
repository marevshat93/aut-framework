import { Page, Locator, expect as playwrightExpect, FrameLocator } from '@playwright/test';
import { Logger } from '../core/logger';
import { TestStepResult } from '../core/step';

export interface UiActionOptions {
  /**
   * Optional timeout in milliseconds for the action.
   */
  timeout?: number;
  /**
   * Whether to force the action (e.g., force click even if element is not visible).
   */
  force?: boolean;
  /**
   * Optional description for logging and step reporting.
   */
  description?: string;
}

export abstract class BasePage {
  constructor(
    protected readonly page: Page,
    protected readonly logger: Logger,
    protected readonly testSteps: TestStepResult[],
  ) {
    this.logger.info(`Initialized page object: ${this.constructor.name}`);
  }

  /**
   * Navigate to a URL.
   */
  async goto(url: string, options?: { timeout?: number; waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' }): Promise<void> {
    const description = `Navigate to ${url}`;
    this.logger.info(`UI ACTION: ${description}`);
    await this.page.goto(url, options);
    this.logger.info(`UI ACTION COMPLETE: ${description}`);
  }

  /**
   * Click on an element.
   */
  async click(locator: Locator | string, options?: UiActionOptions): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    const description = options?.description || `Click on element`;
    this.logger.info(`UI ACTION: ${description}`, { selector: typeof locator === 'string' ? locator : 'Locator object' });

    try {
      await element.click({
        timeout: options?.timeout,
        force: options?.force,
      });
      this.logger.info(`UI ACTION COMPLETE: ${description}`);
    } catch (error) {
      this.logger.error(`UI ACTION FAILED: ${description}`, error as Error);
      throw error;
    }
  }

  /**
   * Double-click on an element.
   */
  async doubleClick(locator: Locator | string, options?: UiActionOptions): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    const description = options?.description || `Double-click on element`;
    this.logger.info(`UI ACTION: ${description}`, { selector: typeof locator === 'string' ? locator : 'Locator object' });

    try {
      await element.dblclick({
        timeout: options?.timeout,
        force: options?.force,
      });
      this.logger.info(`UI ACTION COMPLETE: ${description}`);
    } catch (error) {
      this.logger.error(`UI ACTION FAILED: ${description}`, error as Error);
      throw error;
    }
  }

  /**
   * Right-click on an element.
   */
  async rightClick(locator: Locator | string, options?: UiActionOptions): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    const description = options?.description || `Right-click on element`;
    this.logger.info(`UI ACTION: ${description}`, { selector: typeof locator === 'string' ? locator : 'Locator object' });

    try {
      await element.click({
        button: 'right',
        timeout: options?.timeout,
        force: options?.force,
      });
      this.logger.info(`UI ACTION COMPLETE: ${description}`);
    } catch (error) {
      this.logger.error(`UI ACTION FAILED: ${description}`, error as Error);
      throw error;
    }
  }

  /**
   * Hover over an element.
   */
  async hover(locator: Locator | string, options?: UiActionOptions): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    const description = options?.description || `Hover over element`;
    this.logger.info(`UI ACTION: ${description}`, { selector: typeof locator === 'string' ? locator : 'Locator object' });

    try {
      await element.hover({
        timeout: options?.timeout,
        force: options?.force,
      });
      this.logger.info(`UI ACTION COMPLETE: ${description}`);
    } catch (error) {
      this.logger.error(`UI ACTION FAILED: ${description}`, error as Error);
      throw error;
    }
  }

  /**
   * Fill an input field with text (clears existing content first).
   */
  async fill(locator: Locator | string, value: string, options?: UiActionOptions): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    const description = options?.description || `Fill input with value`;
    this.logger.info(`UI ACTION: ${description}`, {
      selector: typeof locator === 'string' ? locator : 'Locator object',
      value,
    });

    try {
      await element.fill(value, {
        timeout: options?.timeout,
        force: options?.force,
      });
      this.logger.info(`UI ACTION COMPLETE: ${description}`);
    } catch (error) {
      this.logger.error(`UI ACTION FAILED: ${description}`, error as Error);
      throw error;
    }
  }

  /**
   * Type text into an input field (simulates typing character by character).
   */
  async type(locator: Locator | string, text: string, options?: UiActionOptions & { delay?: number }): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    const description = options?.description || `Type text into input`;
    this.logger.info(`UI ACTION: ${description}`, {
      selector: typeof locator === 'string' ? locator : 'Locator object',
      text,
    });

    try {
      await element.type(text, {
        delay: options?.delay,
        timeout: options?.timeout,
      });
      this.logger.info(`UI ACTION COMPLETE: ${description}`);
    } catch (error) {
      this.logger.error(`UI ACTION FAILED: ${description}`, error as Error);
      throw error;
    }
  }

  /**
   * Clear an input field.
   */
  async clear(locator: Locator | string, options?: UiActionOptions): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    const description = options?.description || `Clear input field`;
    this.logger.info(`UI ACTION: ${description}`, { selector: typeof locator === 'string' ? locator : 'Locator object' });

    try {
      await element.clear({
        timeout: options?.timeout,
      });
      this.logger.info(`UI ACTION COMPLETE: ${description}`);
    } catch (error) {
      this.logger.error(`UI ACTION FAILED: ${description}`, error as Error);
      throw error;
    }
  }

  /**
   * Get text content from an element.
   */
  async getText(locator: Locator | string, options?: { timeout?: number }): Promise<string> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    this.logger.info(`UI ACTION: Get text from element`, { selector: typeof locator === 'string' ? locator : 'Locator object' });

    try {
      const text = await element.textContent({
        timeout: options?.timeout,
      });
      const result = text?.trim() || '';
      this.logger.info(`UI ACTION COMPLETE: Get text from element`, { text: result });
      return result;
    } catch (error) {
      this.logger.error(`UI ACTION FAILED: Get text from element`, error as Error);
      throw error;
    }
  }

  /**
   * Get the value of an input field.
   */
  async getValue(locator: Locator | string, options?: { timeout?: number }): Promise<string> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    this.logger.info(`UI ACTION: Get value from input`, { selector: typeof locator === 'string' ? locator : 'Locator object' });

    try {
      const value = await element.inputValue({
        timeout: options?.timeout,
      });
      this.logger.info(`UI ACTION COMPLETE: Get value from input`, { value });
      return value;
    } catch (error) {
      this.logger.error(`UI ACTION FAILED: Get value from input`, error as Error);
      throw error;
    }
  }

  /**
   * Get an attribute value from an element.
   */
  async getAttribute(locator: Locator | string, name: string, options?: { timeout?: number }): Promise<string | null> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    this.logger.info(`UI ACTION: Get attribute "${name}" from element`, { selector: typeof locator === 'string' ? locator : 'Locator object' });

    try {
      const value = await element.getAttribute(name, {
        timeout: options?.timeout,
      });
      this.logger.info(`UI ACTION COMPLETE: Get attribute "${name}" from element`, { value });
      return value;
    } catch (error) {
      this.logger.error(`UI ACTION FAILED: Get attribute "${name}" from element`, error as Error);
      throw error;
    }
  }

  /**
   * Wait for an element to be visible.
   */
  async waitForVisible(locator: Locator | string, options?: { timeout?: number; state?: 'attached' | 'detached' | 'visible' | 'hidden' }): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    const description = `Wait for element to be visible`;
    this.logger.info(`UI ACTION: ${description}`, { selector: typeof locator === 'string' ? locator : 'Locator object' });

    try {
      await element.waitFor({
        state: options?.state || 'visible',
        timeout: options?.timeout,
      });
      this.logger.info(`UI ACTION COMPLETE: ${description}`);
    } catch (error) {
      this.logger.error(`UI ACTION FAILED: ${description}`, error as Error);
      throw error;
    }
  }

  /**
   * Wait for an element to be hidden or removed from DOM.
   */
  async waitForHidden(locator: Locator | string, options?: { timeout?: number }): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    const description = `Wait for element to be hidden`;
    this.logger.info(`UI ACTION: ${description}`, { selector: typeof locator === 'string' ? locator : 'Locator object' });

    try {
      await element.waitFor({
        state: 'hidden',
        timeout: options?.timeout,
      });
      this.logger.info(`UI ACTION COMPLETE: ${description}`);
    } catch (error) {
      this.logger.error(`UI ACTION FAILED: ${description}`, error as Error);
      throw error;
    }
  }

  /**
   * Check if an element is visible.
   */
  async isVisible(locator: Locator | string, options?: { timeout?: number }): Promise<boolean> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    this.logger.info(`UI ACTION: Check if element is visible`, { selector: typeof locator === 'string' ? locator : 'Locator object' });

    try {
      const visible = await element.isVisible({
        timeout: options?.timeout,
      });
      this.logger.info(`UI ACTION COMPLETE: Check if element is visible`, { visible });
      return visible;
    } catch (error) {
      this.logger.info(`UI ACTION COMPLETE: Check if element is visible`, { visible: false });
      return false;
    }
  }

  /**
   * Check if an element is enabled.
   */
  async isEnabled(locator: Locator | string, options?: { timeout?: number }): Promise<boolean> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    this.logger.info(`UI ACTION: Check if element is enabled`, { selector: typeof locator === 'string' ? locator : 'Locator object' });

    try {
      const enabled = await element.isEnabled({
        timeout: options?.timeout,
      });
      this.logger.info(`UI ACTION COMPLETE: Check if element is enabled`, { enabled });
      return enabled;
    } catch (error) {
      this.logger.info(`UI ACTION COMPLETE: Check if element is enabled`, { enabled: false });
      return false;
    }
  }

  /**
   * Check if an element is checked (for checkboxes/radio buttons).
   */
  async isChecked(locator: Locator | string, options?: { timeout?: number }): Promise<boolean> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    this.logger.info(`UI ACTION: Check if element is checked`, { selector: typeof locator === 'string' ? locator : 'Locator object' });

    try {
      const checked = await element.isChecked({
        timeout: options?.timeout,
      });
      this.logger.info(`UI ACTION COMPLETE: Check if element is checked`, { checked });
      return checked;
    } catch (error) {
      this.logger.info(`UI ACTION COMPLETE: Check if element is checked`, { checked: false });
      return false;
    }
  }

  /**
   * Take a screenshot of the page or a specific element.
   */
  async screenshot(options?: { path?: string; fullPage?: boolean; timeout?: number }): Promise<Buffer> {
    const description = `Take screenshot`;
    this.logger.info(`UI ACTION: ${description}`, { path: options?.path, fullPage: options?.fullPage });

    try {
      const buffer = await this.page.screenshot({
        path: options?.path,
        fullPage: options?.fullPage,
        timeout: options?.timeout,
      });
      this.logger.info(`UI ACTION COMPLETE: ${description}`);
      return buffer;
    } catch (error) {
      this.logger.error(`UI ACTION FAILED: ${description}`, error as Error);
      throw error;
    }
  }

  /**
   * Take a screenshot of a specific element.
   */
  async screenshotElement(locator: Locator | string, options?: { path?: string; timeout?: number }): Promise<Buffer> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    const description = `Take screenshot of element`;
    this.logger.info(`UI ACTION: ${description}`, { selector: typeof locator === 'string' ? locator : 'Locator object' });

    try {
      const buffer = await element.screenshot({
        path: options?.path,
        timeout: options?.timeout,
      });
      this.logger.info(`UI ACTION COMPLETE: ${description}`);
      return buffer;
    } catch (error) {
      this.logger.error(`UI ACTION FAILED: ${description}`, error as Error);
      throw error;
    }
  }

  /**
   * Wait for a navigation event (e.g., after clicking a link).
   */
  async waitForNavigation(options?: { timeout?: number; url?: string | RegExp | ((url: URL) => boolean); waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' }): Promise<void> {
    const description = `Wait for navigation`;
    this.logger.info(`UI ACTION: ${description}`, { url: options?.url });

    try {
      await this.page.waitForURL(options?.url || /.*/, {
        timeout: options?.timeout,
        waitUntil: options?.waitUntil,
      });
      this.logger.info(`UI ACTION COMPLETE: ${description}`);
    } catch (error) {
      this.logger.error(`UI ACTION FAILED: ${description}`, error as Error);
      throw error;
    }
  }

  /**
   * Get a locator for an element (helper method).
   */
  protected locator(selector: string): Locator {
    return this.page.locator(selector);
  }

  /**
   * Get a locator for a frame (helper method).
   */
  protected frameLocator(selector: string): FrameLocator {
    return this.page.frameLocator(selector);
  }

  /**
   * Get the underlying Playwright Page object for advanced operations.
   */
  protected get pageObject(): Page {
    return this.page;
  }
}
