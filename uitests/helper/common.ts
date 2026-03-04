import { BrowserContext, Page } from "@playwright/test";

export class _comnmon {
    private page: Page;
    readonly context: BrowserContext
    private baseUrl: any;

    constructor(page: Page, context: BrowserContext, baserUrl?: any){
        this.page = page;
        this.context = context;
        this.baseUrl = baserUrl;
    }

    async loadSite(){
        await this.page.goto("https://dev.itibari.io/");
        await this.page.waitForLoadState('domcontentloaded');
    }
}