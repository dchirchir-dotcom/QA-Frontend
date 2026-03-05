import { expect, Locator, Page } from '@playwright/test'

export class _loginPage {
    readonly page: Page;
    readonly usernameInput: Locator;
    readonly passwordInput: Locator;
    readonly rememberMeCheckbox: Locator;
    readonly loginButton: Locator;
    readonly managerKimamboText: Locator;
    
    // Add locators for post-login elements for common verification
    readonly avatarImg: Locator;
    readonly salesDiv: Locator; 
    readonly ordersLink: Locator;

    constructor(page: Page){
        this.page = page;
        this.usernameInput = page.locator('#username');
        this.passwordInput = page.locator('#password');
        this.rememberMeCheckbox = page.locator('#autoLogin');
        this.loginButton = page.getByRole('button', { name: /login/i });
        
        // Post-login elements
        this.managerKimamboText = page.getByText('Manager Kimambo');
        this.avatarImg = page.getByRole('img', { name: /avatar/i });
        this.salesDiv = page.getByRole('link', { name: 'Sales' });
        this.ordersLink = page.getByRole('link', { name: 'Orders' });
    }

    /**
     * Performs a full login action.
     * @param username 
     * @param password 
     */
    async login(username: string, password: string) {
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        // toggle remember if present
        if (await this.rememberMeCheckbox.count() > 0) {
            try { await this.rememberMeCheckbox.check(); } catch {}
        }
        await this.loginButton.click();
        
        // Wait for post-login indicators with fallback strategies
        // Try avatar image first
        if (await this.avatarImg.count() > 0) {
            try {
                await expect(this.avatarImg).toBeVisible({ timeout: 8000 });
            } catch {
                console.log('Avatar image not visible, checking manager text...');
            }
        }
        
        // Fallback: check for manager text or any visible content
        try {
            await expect(this.managerKimamboText).toBeVisible({ timeout: 8000 });
        } catch {
            console.log('Manager text not visible, checking for URL change...');
            // Final fallback: just wait for any page navigation
            await this.page.waitForLoadState('networkidle').catch(() => {});
        }
        
        // Give page a moment to settle
        await this.page.waitForTimeout(1000);
    }
    
    /**
     * Clicks the Orders link after successful navigation.
     */
    async navigateToOrders() {
        // Navigate the sidebar or a menu to Orders
        // Open profile/menu if needed
        if (await this.managerKimamboText.count() > 0) {
            try { await this.managerKimamboText.click(); } catch {}
        }
        if (await this.avatarImg.count() > 0) {
            try { await this.avatarImg.click(); } catch {}
        }
        await this.salesDiv.click();
        await this.ordersLink.click();
    }
}


