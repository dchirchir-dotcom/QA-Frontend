import { BrowserContext, Page } from "@playwright/test";
import _config from "../config/configManager";

export class _common {
    private page: Page;
    readonly context: BrowserContext
    private baseUrl: any;

    constructor(page: Page, context: BrowserContext, baserUrl?: any){
        this.page = page;
        this.context = context;
        this.baseUrl = baserUrl;
    }

    async loadSite(){
        await this.page.goto(_config.baseUrl);
        await this.page.waitForLoadState('domcontentloaded');
    }
}