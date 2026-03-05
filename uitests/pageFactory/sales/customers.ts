import { expect, Locator, Page } from '@playwright/test'

export class CustomersPage {
  readonly page: Page;
  readonly customersHeading: Locator;
  readonly customersTable: Locator;
  readonly customerRows: Locator;
  readonly createCustomerButton: Locator;
  readonly searchBox: Locator;
  readonly searchButton: Locator;
  readonly statusFilter: Locator;
  readonly regionFilter: Locator;
  readonly typeFilter: Locator;
  readonly refreshButton: Locator;
  readonly exportButton: Locator;
  readonly deleteButton: Locator;
  readonly editButton: Locator;
  readonly viewDetailsButton: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly confirmDialog: Locator;
  readonly confirmYesButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.customersHeading = page.getByRole('heading', { name: /Customers/i });
    this.customersTable = page.locator('table');
    this.customerRows = this.customersTable.locator('tbody tr');

    this.createCustomerButton = page.getByRole('button', { name: /create customer|new customer|add customer/i }).first();
    this.searchButton = page.getByRole('button', { name: /search|query/i }).first();
    this.refreshButton = page.getByRole('button', { name: /refresh|reload/i }).first();
    this.exportButton = page.getByRole('button', { name: /export|download/i }).first();
    this.deleteButton = page.getByRole('button', { name: /delete|remove/i }).first();
    this.editButton = page.getByRole('button', { name: /edit|modify/i }).first();
    this.viewDetailsButton = page.getByRole('button', { name: /view|details|expand/i }).first();
    this.saveButton = page.getByRole('button', { name: /save|submit|ok/i }).first();
    this.cancelButton = page.getByRole('button', { name: /cancel|close/i }).first();

    this.searchBox = page.getByPlaceholder('Search').or(page.getByRole('searchbox', { name: 'Search' })).first();
    this.statusFilter = page.getByRole('combobox', { name: /status/i }).first();
    this.regionFilter = page.getByRole('combobox', { name: /region/i }).first();
    this.typeFilter = page.getByRole('combobox', { name: /type|customer type/i }).first();

    this.confirmDialog = page.locator('[role="dialog"]').first();
    this.confirmYesButton = page.getByRole('button', { name: /yes|confirm|ok|proceed/i }).first();
  }

  async navigateToCustomers() {
    // First try direct navigation
    await this.page.goto('/sales/customers', { waitUntil: 'load' }).catch(async () => {
      // If goto fails, try using the menu
      const salesMenu = this.page.getByRole('link', { name: 'Sales' });
      const customersLink = this.page.getByRole('link', { name: /^Customers$/ });
      
      if (await salesMenu.count() > 0) {
        await salesMenu.click();
        await this.page.waitForTimeout(500);
      }
      
      if (await customersLink.count() > 0) {
        await customersLink.click();
        await this.page.waitForTimeout(1000);
      }
    });
    
    // Wait for table to be visible as confirmation page loaded
    await this.customersTable.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  }

  async searchCustomers(searchTerm: string) {
    if (await this.searchBox.count() > 0) {
      await this.searchBox.fill(searchTerm);
      if (await this.searchButton.count() > 0) {
        await this.searchButton.click();
      } else {
        await this.searchBox.press('Enter');
      }
      await this.page.waitForTimeout(500);
    }
  }

  async filterByStatus(status: string) {
    if (await this.statusFilter.count() > 0) {
      await this.statusFilter.click();
      const option = this.page.getByRole('option', { name: new RegExp(status, 'i') });
      if (await option.count() > 0) {
        await option.click();
        await this.page.waitForTimeout(500);
      }
    }
  }

  async filterByRegion(region: string) {
    if (await this.regionFilter.count() > 0) {
      await this.regionFilter.click();
      const option = this.page.getByRole('option', { name: new RegExp(region, 'i') });
      if (await option.count() > 0) {
        await option.click();
        await this.page.waitForTimeout(500);
      }
    }
  }

  async filterByType(customerType: string) {
    if (await this.typeFilter.count() > 0) {
      await this.typeFilter.click();
      const option = this.page.getByRole('option', { name: new RegExp(customerType, 'i') });
      if (await option.count() > 0) {
        await option.click();
        await this.page.waitForTimeout(500);
      }
    }
  }

  async createNewCustomer() {
    if (await this.createCustomerButton.count() > 0) {
      await this.createCustomerButton.click();
      await this.page.waitForTimeout(1000);
    }
  }

  async fillCustomerForm(data: { name?: string; email?: string; phone?: string; address?: string; region?: string; type?: string; creditLimit?: string }) {
    if (data.name) {
      const nameInput = this.page.getByLabel(/name|customer name/i).first();
      if (await nameInput.count() > 0) await nameInput.fill(data.name);
    }
    if (data.email) {
      const emailInput = this.page.getByLabel(/email/i).first();
      if (await emailInput.count() > 0) await emailInput.fill(data.email);
    }
    if (data.phone) {
      const phoneInput = this.page.getByLabel(/phone|contact/i).first();
      if (await phoneInput.count() > 0) await phoneInput.fill(data.phone);
    }
    if (data.address) {
      const addressInput = this.page.getByLabel(/address|location/i).first();
      if (await addressInput.count() > 0) await addressInput.fill(data.address);
    }
    if (data.creditLimit) {
      const limitInput = this.page.getByLabel(/credit limit|limit/i).first();
      if (await limitInput.count() > 0) await limitInput.fill(data.creditLimit);
    }
  }

  async saveCustomer() {
    if (await this.saveButton.count() > 0) {
      await this.saveButton.click();
      await this.page.waitForTimeout(1000);
    }
  }

  async openCustomerByIndex(index: number) {
    const count = await this.customerRows.count();
    if (count <= index) throw new Error(`Customer row index ${index} out of bounds (count: ${count})`);
    const row = this.customerRows.nth(index);
    await row.click();
    await this.page.waitForTimeout(800);
  }

  async deleteCustomerByIndex(index: number) {
    const row = this.customerRows.nth(index);
    const deleteBtn = row.locator('button:has-text("Delete")').or(row.locator('[aria-label*="delete" i]')).first();
    if (await deleteBtn.count() > 0) {
      await deleteBtn.click();
      if (await this.confirmYesButton.count() > 0) {
        await this.confirmYesButton.click();
      }
      await this.page.waitForTimeout(800);
    }
  }

  async refreshTable() {
    if (await this.refreshButton.count() > 0) {
      await this.refreshButton.click();
      await this.page.waitForTimeout(1000);
    }
  }

  async getCustomerCount(): Promise<number> {
    return await this.customerRows.count();
  }

  async getRowData(rowIndex: number): Promise<string[]> {
    const row = this.customerRows.nth(rowIndex);
    const cells = row.locator('td');
    const count = await cells.count();
    const data: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await cells.nth(i).textContent();
      data.push(text?.trim() || '');
    }
    return data;
  }

  async editCustomerByIndex(index: number, data: { name?: string; email?: string; phone?: string; creditLimit?: string }) {
    await this.openCustomerByIndex(index);
    await this.fillCustomerForm(data);
    await this.saveCustomer();
  }
}
