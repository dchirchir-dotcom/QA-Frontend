import { expect, Locator, Page } from '@playwright/test'

export class SAPerformancePage {
  readonly page: Page;
  readonly performanceHeading: Locator;
  readonly performanceTable: Locator;
  readonly agentRows: Locator;
  readonly searchBox: Locator;
  readonly searchButton: Locator;
  readonly periodFilter: Locator;
  readonly regionFilter: Locator;
  readonly metricFilter: Locator;
  readonly refreshButton: Locator;
  readonly exportButton: Locator;
  readonly viewDetailsButton: Locator;
  readonly compareButton: Locator;
  readonly chartButton: Locator;
  readonly kpiCard: Locator;
  readonly sortButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.performanceHeading = page.getByRole('heading', { name: /Performance|SA Performance|Sales Agent Performance/i });
    this.performanceTable = page.locator('table');
    this.agentRows = this.performanceTable.locator('tbody tr');

    this.searchButton = page.getByRole('button', { name: /search|query/i }).first();
    this.refreshButton = page.getByRole('button', { name: /refresh|reload|update/i }).first();
    this.exportButton = page.getByRole('button', { name: /export|download|report/i }).first();
    this.viewDetailsButton = page.getByRole('button', { name: /view|details|expand/i }).first();
    this.compareButton = page.getByRole('button', { name: /compare|comparison/i }).first();
    this.chartButton = page.getByRole('button', { name: /chart|graph|view chart/i }).first();
    this.sortButton = page.getByRole('button', { name: /sort|order/i }).first();

    this.searchBox = page.getByPlaceholder('Search').or(page.getByRole('searchbox', { name: 'Search' })).first();
    this.periodFilter = page.getByRole('combobox', { name: /period|date range|month|year/i }).first();
    this.regionFilter = page.getByRole('combobox', { name: /region|territory/i }).first();
    this.metricFilter = page.getByRole('combobox', { name: /metric|kpi|measure/i }).first();

    this.kpiCard = page.locator('.ant-card').or(page.locator('[role="presentation"]')).first();
  }

  async navigateToSAPerformance() {
    // First try direct navigation
    await this.page.goto('/sales/salesAgentPerformance', { waitUntil: 'load' }).catch(async () => {
      // If goto fails, try using the menu
      const salesMenu = this.page.getByRole('link', { name: 'Sales' });
      const perfLink = this.page.getByRole('link', { name: /SA Performance|Sales Agent Performance/ });
      
      if (await salesMenu.count() > 0) {
        await salesMenu.click();
        await this.page.waitForTimeout(500);
      }
      
      if (await perfLink.count() > 0) {
        await perfLink.click();
        await this.page.waitForTimeout(1000);
      }
    });
    
    // Wait for table to be visible as confirmation page loaded
    await this.performanceTable.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
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

  async filterByPeriod(period: string) {
    if (await this.periodFilter.count() > 0) {
      await this.periodFilter.click();
      const option = this.page.getByRole('option', { name: new RegExp(period, 'i') });
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

  async filterByMetric(metric: string) {
    if (await this.metricFilter.count() > 0) {
      await this.metricFilter.click();
      const option = this.page.getByRole('option', { name: new RegExp(metric, 'i') });
      if (await option.count() > 0) {
        await option.click();
        await this.page.waitForTimeout(500);
      }
    }
  }

  async viewAgentPerformanceDetails(index: number) {
    const count = await this.agentRows.count();
    if (count <= index) throw new Error(`Agent row index ${index} out of bounds (count: ${count})`);
    const row = this.agentRows.nth(index);
    const detailsBtn = row.locator('button:has-text("View")').or(row.locator('[aria-label*="view" i]')).first();
    if (await detailsBtn.count() > 0) {
      await detailsBtn.click();
      await this.page.waitForTimeout(800);
    } else {
      await row.click();
    }
  }

  async openComparisonChart() {
    if (await this.chartButton.count() > 0) {
      await this.chartButton.click();
      await this.page.waitForTimeout(1000);
    }
  }

  async compareAgents(indices: number[]) {
    if (indices.length >= 2 && await this.compareButton.count() > 0) {
      // Select agents (assuming checkboxes in rows)
      for (const idx of indices) {
        const row = this.agentRows.nth(idx);
        const checkbox = row.locator('input[type="checkbox"]').first();
        if (await checkbox.count() > 0) {
          await checkbox.click();
        }
      }
      await this.compareButton.click();
      await this.page.waitForTimeout(1000);
    }
  }

  async refreshPerformanceData() {
    if (await this.refreshButton.count() > 0) {
      await this.refreshButton.click();
      await this.page.waitForTimeout(1500);
    }
  }

  async exportPerformanceReport(format: string = 'PDF') {
    if (await this.exportButton.count() > 0) {
      await this.exportButton.click();
      const formatOption = this.page.getByRole('option', { name: new RegExp(format, 'i') }).first();
      if (await formatOption.count() > 0) {
        await formatOption.click();
      }
      await this.page.waitForTimeout(1500);
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

  async sortByColumn(columnName: string) {
    if (await this.sortButton.count() > 0) {
      const headerCell = this.page.locator(`th:has-text("${columnName}")`).first();
      if (await headerCell.count() > 0) {
        await headerCell.click();
        await this.page.waitForTimeout(500);
      }
    }
  }
}
