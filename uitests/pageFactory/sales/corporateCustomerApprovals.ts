import { expect, Locator, Page } from '@playwright/test'

export class CorporateCustomerApprovalsPage {
  readonly page: Page;
  readonly approvalsHeading: Locator;
  readonly approvalsTable: Locator;
  readonly approvalRows: Locator;
  readonly searchBox: Locator;
  readonly searchButton: Locator;
  readonly statusFilter: Locator;
  readonly accountTypeFilter: Locator;
  readonly creditLimitFilter: Locator;
  readonly refreshButton: Locator;
  readonly exportButton: Locator;
  readonly approveButton: Locator;
  readonly rejectButton: Locator;
  readonly viewDetailsButton: Locator;
  readonly commentsInput: Locator;
  readonly creditLimitInput: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly confirmDialog: Locator;
  readonly confirmYesButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.approvalsHeading = page.getByRole('heading', { name: /Corporate Customer|Approvals|Corporate Approvals/i });
    this.approvalsTable = page.locator('table');
    this.approvalRows = this.approvalsTable.locator('tbody tr');

    this.searchButton = page.getByRole('button', { name: /search|query/i }).first();
    this.refreshButton = page.getByRole('button', { name: /refresh|reload|update/i }).first();
    this.exportButton = page.getByRole('button', { name: /export|download/i }).first();
    this.approveButton = page.getByRole('button', { name: /approve|confirm|activate/i }).first();
    this.rejectButton = page.getByRole('button', { name: /reject|decline|deny/i }).first();
    this.viewDetailsButton = page.getByRole('button', { name: /view|details|expand/i }).first();
    this.saveButton = page.getByRole('button', { name: /save|submit|ok/i }).first();
    this.cancelButton = page.getByRole('button', { name: /cancel|close/i }).first();

    this.searchBox = page.getByPlaceholder('Search').or(page.getByRole('searchbox', { name: 'Search' })).first();
    this.statusFilter = page.getByRole('combobox', { name: /status|state/i }).first();
    this.accountTypeFilter = page.getByRole('combobox', { name: /account type|type/i }).first();
    this.creditLimitFilter = page.getByRole('combobox', { name: /credit limit|limit/i }).first();

    this.commentsInput = page.getByLabel(/comments|remarks|notes|reason/i).first();
    this.creditLimitInput = page.getByLabel(/credit limit|limit|amount/i).first();
    this.confirmDialog = page.locator('[role="dialog"]').first();
    this.confirmYesButton = page.getByRole('button', { name: /yes|confirm|ok|proceed/i }).first();
  }

  async navigateToCorporateApprovals() {
    // First try direct navigation
    await this.page.goto('/sales/corporate-approvals', { waitUntil: 'load' }).catch(async () => {
      // If goto fails, try using the menu
      const salesMenu = this.page.getByRole('link', { name: 'Sales' });
      const corpApprovalsLink = this.page.getByRole('link', { name: /Corporate Customer Approvals/ });
      
      if (await salesMenu.count() > 0) {
        await salesMenu.click();
        await this.page.waitForTimeout(500);
      }
      
      if (await corpApprovalsLink.count() > 0) {
        await corpApprovalsLink.click();
        await this.page.waitForTimeout(1000);
      }
    });
    
    // Wait for table to be visible as confirmation page loaded
    await this.approvalsTable.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  }

  async searchApprovals(searchTerm: string) {
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

  async filterByAccountType(accountType: string) {
    if (await this.accountTypeFilter.count() > 0) {
      await this.accountTypeFilter.click();
      const option = this.page.getByRole('option', { name: new RegExp(accountType, 'i') });
      if (await option.count() > 0) {
        await option.click();
        await this.page.waitForTimeout(500);
      }
    }
  }

  async approveCustomerByIndex(index: number, creditLimit?: string, comments?: string) {
    const count = await this.approvalRows.count();
    if (count <= index) throw new Error(`Corporate approval row index ${index} out of bounds (count: ${count})`);
    const row = this.approvalRows.nth(index);

    // Set credit limit if provided
    if (creditLimit && await this.creditLimitInput.count() > 0) {
      await this.creditLimitInput.clear();
      await this.creditLimitInput.fill(creditLimit);
    }

    // Add comments if provided
    if (comments && await this.commentsInput.count() > 0) {
      await this.commentsInput.fill(comments);
    }

    const approveBtn = row.locator('button:has-text("Approve")').or(row.locator('[aria-label*="approve" i]')).first();
    if (await approveBtn.count() > 0) {
      await approveBtn.click();
      if (await this.confirmYesButton.count() > 0) {
        await this.confirmYesButton.click();
      }
      await this.page.waitForTimeout(800);
    }
  }

  async rejectCustomerByIndex(index: number, reason?: string) {
    const count = await this.approvalRows.count();
    if (count <= index) throw new Error(`Corporate approval row index ${index} out of bounds (count: ${count})`);
    const row = this.approvalRows.nth(index);

    // Add rejection reason if provided
    if (reason && await this.commentsInput.count() > 0) {
      await this.commentsInput.fill(reason);
    }

    const rejectBtn = row.locator('button:has-text("Reject")').or(row.locator('[aria-label*="reject" i]')).first();
    if (await rejectBtn.count() > 0) {
      await rejectBtn.click();
      if (await this.confirmYesButton.count() > 0) {
        await this.confirmYesButton.click();
      }
      await this.page.waitForTimeout(800);
    }
  }

  async viewApprovalDetails(index: number) {
    const count = await this.approvalRows.count();
    if (count <= index) throw new Error(`Corporate approval row index ${index} out of bounds (count: ${count})`);
    const row = this.approvalRows.nth(index);
    const detailsBtn = row.locator('button:has-text("View")').or(row.locator('[aria-label*="view" i]')).first();
    if (await detailsBtn.count() > 0) {
      await detailsBtn.click();
      await this.page.waitForTimeout(800);
    } else {
      await row.click();
    }
  }

  async getApprovalCount(): Promise<number> {
    return await this.approvalRows.count();
  }

  async getRowData(rowIndex: number): Promise<string[]> {
    const row = this.approvalRows.nth(rowIndex);
    const cells = row.locator('td');
    const count = await cells.count();
    const data: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await cells.nth(i).textContent();
      data.push(text?.trim() || '');
    }
    return data;
  }

  async refreshApprovals() {
    if (await this.refreshButton.count() > 0) {
      await this.refreshButton.click();
      await this.page.waitForTimeout(1000);
    }
  }

  async bulkApproveByIndices(indices: number[], creditLimit?: string, comments?: string) {
    for (const idx of indices) {
      if (idx < await this.approvalRows.count()) {
        await this.approveCustomerByIndex(idx, creditLimit, comments);
      }
    }
  }

  async bulkRejectByIndices(indices: number[], reason?: string) {
    for (const idx of indices) {
      if (idx < await this.approvalRows.count()) {
        await this.rejectCustomerByIndex(idx, reason);
      }
    }
  }

  async exportApprovals(format: string = 'CSV') {
    if (await this.exportButton.count() > 0) {
      await this.exportButton.click();
      const formatOption = this.page.getByRole('option', { name: new RegExp(format, 'i') }).first();
      if (await formatOption.count() > 0) {
        await formatOption.click();
      }
      await this.page.waitForTimeout(1500);
    }
  }
}
