import { expect, Locator, Page } from '@playwright/test'

export class _customerPage {

    readonly page: Page;
    readonly loginButton: Locator;
    readonly customersMenu: Locator;
    readonly customerListLink: Locator;
    readonly customerHeader: Locator;
    readonly searchBox: Locator;
    readonly searchButton: Locator;

  constructor(page: Page){ 
    this.page = page;
    // Locators
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.customersMenu = page.getByText('Customers');
    this.customerListLink = page.getByRole('link', { name: 'Customers List' });
    this.customerHeader = page.locator('div').filter({ hasText: /^Customers$/ }).nth(2);
    this.searchBox = page.getByRole('searchbox', { name: 'Search' });
    this.searchButton = page.getByRole('button', { name: 'search' });
  }

async navigateToCustomerList() {
    await this.customersMenu.click();
    await this.customerListLink.click();
    await this.customerHeader.click();
  }

  async searchForCustomer(term: string) {
    await this.searchBox.click();
    await this.searchBox.fill(term);
    await this.searchBox.press('Enter');
    await this.searchButton.click();
  }
}