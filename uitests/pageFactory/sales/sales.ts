import { expect, Locator, Page } from '@playwright/test'

export class SalesPage {
  readonly page: Page;
  readonly salesNav: Locator;
  readonly ordersLink: Locator;
  readonly customersLink: Locator;
  readonly salesAgentLink: Locator;
  readonly vanSalesLink: Locator;
  readonly saPerformanceLink: Locator;
  readonly discountsLink: Locator;
  readonly discountApprovalsLink: Locator;
  readonly corporateApprovalsLink: Locator;
  readonly ordersHeading: Locator;
  readonly ordersTable: Locator;
  readonly orderRows: Locator;
  readonly orderSearchBox: Locator;
  readonly orderSearchButton: Locator;
  readonly createOrderButton: Locator;
  readonly filterDropdown: Locator;

  constructor(page: Page) {
    this.page = page;
    // Navigation
    this.salesNav = page.getByRole('link', { name: 'Sales' });
    this.ordersLink = page.getByRole('link', { name: 'Orders' });
    this.customersLink = page.getByRole('link', { name: 'Customers' });
    this.salesAgentLink = page.getByRole('link', { name: 'Sales Agent' });
    this.vanSalesLink = page.getByRole('link', { name: 'Van Sales' });
    this.saPerformanceLink = page.getByRole('link', { name: /SA Performance|Sales Agent Performance/ });
    this.discountsLink = page.getByRole('link', { name: 'Discounts' });
    this.discountApprovalsLink = page.getByRole('link', { name: 'Discount Approvals' });
    this.corporateApprovalsLink = page.getByRole('link', { name: 'Corporate Customer Approvals' });

    // Orders page elements
    this.ordersHeading = page.getByRole('heading', { name: /Orders/i });
    this.ordersTable = page.locator('table');
    this.orderRows = this.ordersTable.locator('tbody tr');
    this.orderSearchBox = page.getByPlaceholder('Search').or(page.getByRole('searchbox', { name: 'Search' }));
    this.orderSearchButton = page.getByRole('button', { name: /search/i });
    this.createOrderButton = page.getByRole('button', { name: /create order|new order|add order/i }).first();
    this.filterDropdown = page.getByRole('combobox', { name: /filter|status/i }).first();
  }

  async navigateToOrders() {
    await this.salesNav.click();
    if (await this.ordersLink.count() > 0) {
      await this.ordersLink.click();
      await this.page.waitForTimeout(800);
    }
    await expect(this.ordersHeading).toBeVisible({ timeout: 10000 });
  }

  async navigateToCustomers() {
    await this.salesNav.click();
    if (await this.customersLink.count() > 0) {
      await this.customersLink.click();
      await this.page.waitForTimeout(800);
    }
  }

  async navigateToSalesAgents() {
    await this.salesNav.click();
    if (await this.salesAgentLink.count() > 0) {
      await this.salesAgentLink.click();
      await this.page.waitForTimeout(800);
    }
  }

  async navigateToVanSales() {
    await this.salesNav.click();
    if (await this.vanSalesLink.count() > 0) {
      await this.vanSalesLink.click();
      await this.page.waitForTimeout(800);
    }
  }

  async navigateToSAPerformance() {
    await this.salesNav.click();
    if (await this.saPerformanceLink.count() > 0) {
      await this.saPerformanceLink.click();
      await this.page.waitForTimeout(800);
    }
  }

  async navigateToDiscounts() {
    await this.salesNav.click();
    if (await this.discountsLink.count() > 0) {
      await this.discountsLink.click();
      await this.page.waitForTimeout(800);
    }
  }

  async navigateToDiscountApprovals() {
    await this.salesNav.click();
    if (await this.discountApprovalsLink.count() > 0) {
      await this.discountApprovalsLink.click();
      await this.page.waitForTimeout(800);
    }
  }

  async navigateToCorporateApprovals() {
    await this.salesNav.click();
    if (await this.corporateApprovalsLink.count() > 0) {
      await this.corporateApprovalsLink.click();
      await this.page.waitForTimeout(800);
    }
  }

  async searchOrders(term: string) {
    if (await this.orderSearchBox.count() > 0) {
      await this.orderSearchBox.fill(term);
      if (await this.orderSearchButton.count() > 0) await this.orderSearchButton.click();
      else await this.orderSearchBox.press('Enter');
    }
  }

  async openOrderByIndex(index: number) {
    const count = await this.orderRows.count();
    if (count <= index) throw new Error(`Order row index ${index} out of bounds (count: ${count})`);
    await this.orderRows.nth(index).click();
  }

  async filterByStatus(status: string) {
    if (await this.filterDropdown.count() > 0) {
      await this.filterDropdown.selectOption({ label: status }).catch(() => {});
    }
  }

  async createNewOrder() {
    if (await this.createOrderButton.count() > 0) await this.createOrderButton.click();
  }
}
