import { expect, Locator, Page } from '@playwright/test'

export class SalesAgentPage {
  readonly page: Page;
  readonly agentsHeading: Locator;
  readonly agentsTable: Locator;
  readonly agentRows: Locator;
  readonly createAgentButton: Locator;
  readonly searchBox: Locator;
  readonly searchButton: Locator;
  readonly statusFilter: Locator;
  readonly regionFilter: Locator;
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

    this.agentsHeading = page.getByRole('heading', { name: /Sales Agent|Agent/i });
    this.agentsTable = page.locator('table');
    this.agentRows = this.agentsTable.locator('tbody tr');

    this.createAgentButton = page.getByRole('button', { name: /create agent|new agent|add agent|create sales agent/i }).first();
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
    this.regionFilter = page.getByRole('combobox', { name: /region|territory/i }).first();

    this.confirmDialog = page.locator('[role="dialog"]').first();
    this.confirmYesButton = page.getByRole('button', { name: /yes|confirm|ok|proceed/i }).first();
  }

  async navigateToSalesAgents() {
    // First try direct navigation
    await this.page.goto('/sales/salesAgent', { waitUntil: 'load' }).catch(async () => {
      // If goto fails, try using the menu
      const salesMenu = this.page.getByRole('link', { name: 'Sales' });
      const agentsLink = this.page.getByRole('link', { name: /Sales Agent/ });
      
      if (await salesMenu.count() > 0) {
        await salesMenu.click();
        await this.page.waitForTimeout(500);
      }
      
      if (await agentsLink.count() > 0) {
        await agentsLink.click();
        await this.page.waitForTimeout(1000);
      }
    });
    
    // Wait for table to be visible as confirmation page loaded
    await this.agentsTable.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  }

  async searchAgents(searchTerm: string) {
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

  async createNewAgent() {
    if (await this.createAgentButton.count() > 0) {
      await this.createAgentButton.click();
      await this.page.waitForTimeout(1000);
    }
  }

  async fillAgentForm(data: { name?: string; email?: string; phone?: string; region?: string; territory?: string; commissionRate?: string; status?: string }) {
    if (data.name) {
      const nameInput = this.page.getByLabel(/name|agent name|full name/i).first();
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
    if (data.region) {
      const regionSelect = this.page.getByLabel(/region/i).first();
      if (await regionSelect.count() > 0) {
        await regionSelect.click();
        const option = this.page.getByRole('option', { name: new RegExp(data.region, 'i') });
        if (await option.count() > 0) await option.click();
      }
    }
    if (data.territory) {
      const territoryInput = this.page.getByLabel(/territory|assigned territory/i).first();
      if (await territoryInput.count() > 0) await territoryInput.fill(data.territory);
    }
    if (data.commissionRate) {
      const commissionInput = this.page.getByLabel(/commission|rate/i).first();
      if (await commissionInput.count() > 0) await commissionInput.fill(data.commissionRate);
    }
  }

  async saveAgent() {
    if (await this.saveButton.count() > 0) {
      await this.saveButton.click();
      await this.page.waitForTimeout(1000);
    }
  }

  async openAgentByIndex(index: number) {
    const count = await this.agentRows.count();
    if (count <= index) throw new Error(`Agent row index ${index} out of bounds (count: ${count})`);
    const row = this.agentRows.nth(index);
    await row.click();
    await this.page.waitForTimeout(800);
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

  async getAgentCount(): Promise<number> {
    return await this.agentRows.count();
  }

  async getRowData(rowIndex: number): Promise<string[]> {
    const row = this.agentRows.nth(rowIndex);
    const cells = row.locator('td');
    const count = await cells.count();
    const data: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await cells.nth(i).textContent();
      data.push(text?.trim() || '');
    }
    return data;
  }

  async editAgentByIndex(index: number, data: { name?: string; email?: string; territory?: string; commissionRate?: string }) {
    await this.openAgentByIndex(index);
    await this.fillAgentForm(data);
    await this.saveAgent();
  }

  async deleteAgentByIndex(index: number) {
    const row = this.agentRows.nth(index);
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
}
