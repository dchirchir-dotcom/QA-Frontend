import { expect, Locator, Page } from '@playwright/test'

export class _loginPage {
    readonly page: Page;
    readonly loginLink: Locator;
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
        this.loginLink = page.locator("");
        this.usernameInput = page.getByRole('textbox', { name: 'Username' });
        this.passwordInput = page.getByRole('textbox', { name: 'Password' });
        this.rememberMeCheckbox = page.getByRole('checkbox', { name: 'Remember Me' });
        this.loginButton = page.getByRole('button', { name: 'Login' });
        
        // Post-login elements
        this.managerKimamboText = page.getByText('Manager Kimambo');
        this.avatarImg = page.getByRole('img', { name: 'avatar' });
        this.salesDiv = page.locator('div').filter({ hasText: /^Sales$/ }).nth(1);
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
        await this.rememberMeCheckbox.check();
        await this.loginButton.click();
        await this.page.waitForTimeout(5000);
        await expect(this.avatarImg).toBeVisible();
        await expect(this.managerKimamboText).toBeVisible();
    }
    
    /**
     * Clicks the Orders link after successful navigation.
     */
    async navigateToOrders() {
        // Navigate the sidebar or a menu
        await this.managerKimamboText.click(); 
        await this.avatarImg.click();
        await this.salesDiv.click();
        await this.ordersLink.click();
    }
}


