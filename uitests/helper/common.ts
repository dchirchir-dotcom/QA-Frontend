import { BrowserContext, Page } from '@playwright/test';
import _config from '../config/configManager';

export class _common {
  private page: Page;
  readonly context: BrowserContext;
  private baseUrl?: string;

  constructor(page: Page, context: BrowserContext, baseUrl?: string) {
    this.page = page;
    this.context = context;
    this.baseUrl = baseUrl;
  }

  async loadSite() {
    await this.page.goto(this.baseUrl || _config.baseUrl);
    await this.page.waitForLoadState('domcontentloaded');
  }
}
