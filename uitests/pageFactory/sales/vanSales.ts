import { expect, Locator, Page } from '@playwright/test'

export class VanSalesPage {
  readonly page: Page;
  readonly vanSalesHeading: Locator;
  readonly vanRoutesTable: Locator;
  readonly routeRows: Locator;
  readonly createRouteButton: Locator;
  readonly searchBox: Locator;
  readonly searchButton: Locator;
  readonly statusFilter: Locator;
  readonly driverFilter: Locator;
  readonly startDateFilter: Locator;
  readonly endDateFilter: Locator;
  readonly refreshButton: Locator;
  readonly exportButton: Locator;
  readonly deleteButton: Locator;
  readonly editButton: Locator;
  readonly viewDetailsButton: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly confirmDialog: Locator;
  readonly confirmYesButton: Locator;
  readonly trackVanButton: Locator;
  readonly inventory: Locator;

  constructor(page: Page) {
    this.page = page;

    this.vanSalesHeading = page.getByRole('heading', { name: /Van Sales|Van Route/i });
    this.vanRoutesTable = page.locator('table');
    this.routeRows = this.vanRoutesTable.locator('tbody tr');

    this.createRouteButton = page.getByRole('button', { name: /create route|new route|add route|create van sales/i }).first();
    this.searchButton = page.getByRole('button', { name: /search|query/i }).first();
    this.refreshButton = page.getByRole('button', { name: /refresh|reload/i }).first();
    this.exportButton = page.getByRole('button', { name: /export|download/i }).first();
    this.deleteButton = page.getByRole('button', { name: /delete|remove/i }).first();
    this.editButton = page.getByRole('button', { name: /edit|modify/i }).first();
    this.viewDetailsButton = page.getByRole('button', { name: /view|details|expand/i }).first();
    this.saveButton = page.getByRole('button', { name: /save|submit|ok/i }).first();
    this.cancelButton = page.getByRole('button', { name: /cancel|close/i }).first();
    this.trackVanButton = page.getByRole('button', { name: /track|location|map/i }).first();

    this.searchBox = page.getByPlaceholder('Search').or(page.getByRole('searchbox', { name: 'Search' })).first();
    this.statusFilter = page.getByRole('combobox', { name: /status/i }).first();
    this.driverFilter = page.getByRole('combobox', { name: /driver|agent/i }).first();
    this.startDateFilter = page.getByLabel(/start|from date/i).first();
    this.endDateFilter = page.getByLabel(/end|to date/i).first();

    this.confirmDialog = page.locator('[role="dialog"]').first();
    this.confirmYesButton = page.getByRole('button', { name: /yes|confirm|ok|proceed/i }).first();
    this.inventory = page.getByRole('button', { name: /inventory|stock/i }).first();
  }

  async navigateToVanSales() {
    // First try direct navigation
    await this.page.goto('/sales/vanSales', { waitUntil: 'load' }).catch(async () => {
      // If goto fails, try using the menu
      const salesMenu = this.page.getByRole('link', { name: 'Sales' });
      const vanSalesLink = this.page.getByRole('link', { name: /Van Sales/ });
      
      if (await salesMenu.count() > 0) {
        await salesMenu.click();
        await this.page.waitForTimeout(500);
      }
      
      if (await vanSalesLink.count() > 0) {
        await vanSalesLink.click();
        await this.page.waitForTimeout(1000);
      }
    });
    
    // Wait for table to be visible as confirmation page loaded
    await this.vanRoutesTable.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  }

  async searchRoutes(searchTerm: string) {
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

  async createNewRoute() {
    if (await this.createRouteButton.count() > 0) {
      await this.createRouteButton.click();
      await this.page.waitForTimeout(1000);
    }
  }

  async fillRouteForm(data: { name?: string; driver?: string; vehicle?: string; startDate?: string; endDate?: string; stops?: string; notes?: string }) {
    if (data.name) {
      const nameInput = this.page.getByLabel(/route name|name/i).first();
      if (await nameInput.count() > 0) await nameInput.fill(data.name);
    }
    if (data.driver) {
      const driverSelect = this.page.getByLabel(/driver|assigned driver/i).first();
      if (await driverSelect.count() > 0) {
        await driverSelect.click();
        const option = this.page.getByRole('option', { name: new RegExp(data.driver, 'i') });
        if (await option.count() > 0) await option.click();
      }
    }
    if (data.vehicle) {
      const vehicleInput = this.page.getByLabel(/vehicle|van|registration/i).first();
      if (await vehicleInput.count() > 0) await vehicleInput.fill(data.vehicle);
    }
    if (data.startDate) {
      const startInput = this.page.getByLabel(/start date|from/i).first();
      if (await startInput.count() > 0) await startInput.fill(data.startDate);
    }
    if (data.endDate) {
      const endInput = this.page.getByLabel(/end date|to/i).first();
      if (await endInput.count() > 0) await endInput.fill(data.endDate);
    }
    if (data.stops) {
      const stopsInput = this.page.getByLabel(/stops|destinations/i).first();
      if (await stopsInput.count() > 0) await stopsInput.fill(data.stops);
    }
  }

  async saveRoute() {
    if (await this.saveButton.count() > 0) {
      await this.saveButton.click();
      await this.page.waitForTimeout(1000);
    }
  }

  async openRouteByIndex(index: number) {
    const count = await this.routeRows.count();
    if (count <= index) throw new Error(`Route row index ${index} out of bounds (count: ${count})`);
    const row = this.routeRows.nth(index);
    await row.click();
    await this.page.waitForTimeout(800);
  }

  async trackVan(index: number) {
    const row = this.routeRows.nth(index);
    const trackBtn = row.locator('button:has-text("Track")').or(row.locator('[aria-label*="track" i]')).first();
    if (await trackBtn.count() > 0) {
      await trackBtn.click();
      await this.page.waitForTimeout(1000);
    }
  }

  async viewInventory(index: number) {
    const row = this.routeRows.nth(index);
    const invBtn = row.locator('button:has-text("Inventory")').or(row.locator('[aria-label*="inventory" i]')).first();
    if (await invBtn.count() > 0) {
      await invBtn.click();
      await this.page.waitForTimeout(800);
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

  async getRouteCount(): Promise<number> {
    return await this.routeRows.count();
  }

  async deleteRouteByIndex(index: number) {
    const row = this.routeRows.nth(index);
    const deleteBtn = row.locator('button:has-text("Delete")').or(row.locator('[aria-label*="delete" i]')).first();
    if (await deleteBtn.count() > 0) {
      await deleteBtn.click();
      if (await this.confirmYesButton.count() > 0) {
        await this.confirmYesButton.click();
      }
      await this.page.waitForTimeout(800);
    }
  }
}
