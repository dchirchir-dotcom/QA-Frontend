import { expect, Locator, Page } from '@playwright/test'

export class DiscountsPage {
  readonly page: Page;
  readonly discountsHeading: Locator;
  readonly discountsTable: Locator;
  readonly discountRows: Locator;
  readonly createDiscountButton: Locator;
  readonly searchBox: Locator;
  readonly searchButton: Locator;
  readonly statusFilter: Locator;
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
  readonly applyButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.discountsHeading = page.getByRole('heading', { name: /Discounts/i });
    this.discountsTable = page.locator('table');
    this.discountRows = this.discountsTable.locator('tbody tr');

    this.createDiscountButton = page.getByRole('button', { name: /create discount|new discount|add discount|create/i }).first();
    this.searchButton = page.getByRole('button', { name: /search|query/i }).first();
    this.refreshButton = page.getByRole('button', { name: /refresh|reload/i }).first();
    this.exportButton = page.getByRole('button', { name: /export|download/i }).first();
    this.deleteButton = page.getByRole('button', { name: /delete|remove/i }).first();
    this.editButton = page.getByRole('button', { name: /edit|modify/i }).first();
    this.viewDetailsButton = page.getByRole('button', { name: /view|details|expand/i }).first();
    this.saveButton = page.getByRole('button', { name: /save|submit|ok/i }).first();
    this.cancelButton = page.getByRole('button', { name: /cancel|close/i }).first();
    this.applyButton = page.getByRole('button', { name: /apply|submit for approval/i }).first();

    this.searchBox = page.getByPlaceholder('Search').or(page.getByRole('searchbox', { name: 'Search' })).first();
    this.statusFilter = page.getByRole('combobox', { name: /status|state/i }).first();
    this.typeFilter = page.getByRole('combobox', { name: /type|discount type/i }).first();

    this.confirmDialog = page.locator('[role="dialog"]').first();
    this.confirmYesButton = page.getByRole('button', { name: /yes|confirm|ok|proceed/i }).first();
  }

  async navigateToDiscounts() {
    // First try direct navigation
    await this.page.goto('/sales/discounts', { waitUntil: 'load' }).catch(async () => {
      // If goto fails, try using the menu
      const salesMenu = this.page.getByRole('link', { name: 'Sales' });
      const discountsLink = this.page.getByRole('link', { name: /^Discounts$/ });
      
      if (await salesMenu.count() > 0) {
        await salesMenu.click();
        await this.page.waitForTimeout(500);
      }
      
      if (await discountsLink.count() > 0) {
        await discountsLink.click();
        await this.page.waitForTimeout(1000);
      }
    });
    
    // Wait for table to be visible as confirmation page loaded
    await this.discountsTable.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  }

  async searchDiscounts(searchTerm: string) {
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

  async filterByType(discountType: string) {
    if (await this.typeFilter.count() > 0) {
      await this.typeFilter.click();
      const option = this.page.getByRole('option', { name: new RegExp(discountType, 'i') });
      if (await option.count() > 0) {
        await option.click();
        await this.page.waitForTimeout(500);
      }
    }
  }

  async createNewDiscount() {
    if (await this.createDiscountButton.count() > 0) {
      await this.createDiscountButton.click();
      await this.page.waitForTimeout(1000);
    }
  }

  async fillDiscountForm(data: { code?: string; description?: string; type?: string; value?: string; startDate?: string; endDate?: string; minAmount?: string; maxUsage?: string }) {
    if (data.code) {
      const codeInput = this.page.getByLabel(/code|discount code/i).first();
      if (await codeInput.count() > 0) await codeInput.fill(data.code);
    }
    if (data.description) {
      const descInput = this.page.getByLabel(/description/i).first();
      if (await descInput.count() > 0) await descInput.fill(data.description);
    }
    if (data.type) {
      const typeSelect = this.page.getByLabel(/type|discount type/i).first();
      if (await typeSelect.count() > 0) {
        await typeSelect.click();
        const option = this.page.getByRole('option', { name: new RegExp(data.type, 'i') });
        if (await option.count() > 0) await option.click();
      }
    }
    if (data.value) {
      const valueInput = this.page.getByLabel(/value|amount|percentage/i).first();
      if (await valueInput.count() > 0) await valueInput.fill(data.value);
    }
    if (data.startDate) {
      const startInput = this.page.getByLabel(/start date|from/i).first();
      if (await startInput.count() > 0) await startInput.fill(data.startDate);
    }
    if (data.endDate) {
      const endInput = this.page.getByLabel(/end date|to/i).first();
      if (await endInput.count() > 0) await endInput.fill(data.endDate);
    }
    if (data.minAmount) {
      const minInput = this.page.getByLabel(/minimum|min amount/i).first();
      if (await minInput.count() > 0) await minInput.fill(data.minAmount);
    }
    if (data.maxUsage) {
      const maxInput = this.page.getByLabel(/maximum|max usage|max uses/i).first();
      if (await maxInput.count() > 0) await maxInput.fill(data.maxUsage);
    }
  }

  async saveDiscount() {
    if (await this.saveButton.count() > 0) {
      await this.saveButton.click();
      await this.page.waitForTimeout(1000);
    }
  }

  async submitDiscountForApproval() {
    if (await this.applyButton.count() > 0) {
      await this.applyButton.click();
      await this.page.waitForTimeout(1000);
    }
  }

  async openDiscountByIndex(index: number) {
    const count = await this.discountRows.count();
    if (count <= index) throw new Error(`Discount row index ${index} out of bounds (count: ${count})`);
    const row = this.discountRows.nth(index);
    await row.click();
    await this.page.waitForTimeout(800);
  }

  async deleteDiscountByIndex(index: number) {
    const row = this.discountRows.nth(index);
    const deleteBtn = row.locator('button:has-text("Delete")').or(row.locator('[aria-label*="delete" i]')).first();
    if (await deleteBtn.count() > 0) {
      await deleteBtn.click();
      if (await this.confirmYesButton.count() > 0) {
        await this.confirmYesButton.click();
      }
      await this.page.waitForTimeout(800);
    }
  }

  async getDiscountCount(): Promise<number> {
    return await this.discountRows.count();
  }

  async getRowData(rowIndex: number): Promise<string[]> {
    const row = this.discountRows.nth(rowIndex);
    const cells = row.locator('td');
    const count = await cells.count();
    const data: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await cells.nth(i).textContent();
      data.push(text?.trim() || '');
    }
    return data;
  }
}
