import { expect, Locator, Page } from '@playwright/test'

export class DiscountApprovalsPage {
  readonly page: Page;
  readonly approvalsHeading: Locator;
  readonly approvalsTable: Locator;
  readonly approvalRows: Locator;
  readonly searchBox: Locator;
  readonly searchButton: Locator;
  readonly statusFilter: Locator;
  readonly priorityFilter: Locator;
  readonly dateRangeFilter: Locator;
  readonly refreshButton: Locator;
  readonly exportButton: Locator;
  readonly approveButton: Locator;
  readonly rejectButton: Locator;
  readonly pendingButton: Locator;
  readonly viewDetailsButton: Locator;
  readonly commentsInput: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly confirmDialog: Locator;
  readonly confirmYesButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.approvalsHeading = page.getByRole('heading', { name: /Discount Approvals|Approvals/i });
    this.approvalsTable = page.locator('table');
    this.approvalRows = this.approvalsTable.locator('tbody tr');

    this.searchButton = page.getByRole('button', { name: /search|query/i }).first();
    this.refreshButton = page.getByRole('button', { name: /refresh|reload|update/i }).first();
    this.exportButton = page.getByRole('button', { name: /export|download/i }).first();
    this.approveButton = page.getByRole('button', { name: /approve|confirm/i }).first();
    this.rejectButton = page.getByRole('button', { name: /reject|decline|deny/i }).first();
    this.pendingButton = page.getByRole('button', { name: /pending|hold/i }).first();
    this.viewDetailsButton = page.getByRole('button', { name: /view|details|expand/i }).first();
    this.saveButton = page.getByRole('button', { name: /save|submit|ok/i }).first();
    this.cancelButton = page.getByRole('button', { name: /cancel|close/i }).first();

    this.searchBox = page.getByPlaceholder('Search').or(page.getByRole('searchbox', { name: 'Search' })).first();
    this.statusFilter = page.getByRole('combobox', { name: /status|state/i }).first();
    this.priorityFilter = page.getByRole('combobox', { name: /priority/i }).first();
    this.dateRangeFilter = page.getByLabel(/date|from|to/i).first();

    this.commentsInput = page.getByLabel(/comments|remarks|notes/i).first();
    this.confirmDialog = page.locator('[role="dialog"]').first();
    this.confirmYesButton = page.getByRole('button', { name: /yes|confirm|ok|proceed/i }).first();
  }

  async navigateToDiscountApprovals() {
    // First try direct navigation
    await this.page.goto('/sales/discounts-approvals', { waitUntil: 'load' }).catch(async () => {
      // If goto fails, try using the menu
      const salesMenu = this.page.getByRole('link', { name: 'Sales' });
      const approvalsLink = this.page.getByRole('link', { name: /Discount Approvals/ });
      
      if (await salesMenu.count() > 0) {
        await salesMenu.click();
        await this.page.waitForTimeout(500);
      }
      
      if (await approvalsLink.count() > 0) {
        await approvalsLink.click();
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

  async filterByPriority(priority: string) {
    if (await this.priorityFilter.count() > 0) {
      await this.priorityFilter.click();
      const option = this.page.getByRole('option', { name: new RegExp(priority, 'i') });
      if (await option.count() > 0) {
        await option.click();
        await this.page.waitForTimeout(500);
      }
    }
  }

  async approveRequestByIndex(index: number, comments?: string) {
    const count = await this.approvalRows.count();
    if (count <= index) throw new Error(`Approval row index ${index} out of bounds (count: ${count})`);
    const row = this.approvalRows.nth(index);
    
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

  async rejectRequestByIndex(index: number, reason?: string) {
    const count = await this.approvalRows.count();
    if (count <= index) throw new Error(`Approval row index ${index} out of bounds (count: ${count})`);
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
    if (count <= index) throw new Error(`Approval row index ${index} out of bounds (count: ${count})`);
    const row = this.approvalRows.nth(index);
    const detailsBtn = row.locator('button:has-text("View")').or(row.locator('[aria-label*="view" i]')).first();
    if (await detailsBtn.count() > 0) {
      await detailsBtn.click();
      await this.page.waitForTimeout(800);
    } else {
      await row.click();
    }
  }

  async getPendingCount(): Promise<number> {
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

  async bulkApproveByIndices(indices: number[]) {
    for (const idx of indices) {
      if (idx < await this.approvalRows.count()) {
        await this.approveRequestByIndex(idx);
      }
    }
  }

  async bulkRejectByIndices(indices: number[], reason?: string) {
    for (const idx of indices) {
      if (idx < await this.approvalRows.count()) {
        await this.rejectRequestByIndex(idx, reason);
      }
    }
  }
}
