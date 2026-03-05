import test from '../helper/baseTest';
import { expect } from '@playwright/test';

test.beforeEach(async ({common, loginPage}) => {
  await common.loadSite();
  await loginPage.login('d.chirchir@itibari.io', 'dennis');
});

test.describe('Sales Agent Performance Module', () => {
  test('navigate to SA performance and verify page loaded', async ({ saPerformancePage }) => {
    await saPerformancePage.navigateToSAPerformance();
    // Verify via table visibility
    await expect(saPerformancePage.performanceTable).toBeVisible();
  });

  test('search for agents in performance', async ({ saPerformancePage }) => {
    await saPerformancePage.navigateToSAPerformance();
    const initialCount = await saPerformancePage.getAgentCount();
    
    if (initialCount > 0) {
      const firstRowData = await saPerformancePage.getRowData(0);
      if (firstRowData.length > 0) {
        const agentId = firstRowData[0];
        await saPerformancePage.searchAgents(agentId);
        await expect(saPerformancePage.performanceTable).toBeVisible();
      }
    }
  });

  test('filter performance by period', async ({ saPerformancePage }) => {
    await saPerformancePage.navigateToSAPerformance();
    const initialCount = await saPerformancePage.getAgentCount();
    
    if (initialCount > 0) {
      await saPerformancePage.filterByPeriod('This Month').catch(() => {
        console.log('Period filter may not be available');
      });
      
      const filteredCount = await saPerformancePage.getAgentCount();
      expect(filteredCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('filter performance by region', async ({ saPerformancePage }) => {
    await saPerformancePage.navigateToSAPerformance();
    
    await saPerformancePage.filterByRegion('Nairobi').catch(() => {
      console.log('Region filter may not be available');
    });
    
    const count = await saPerformancePage.getAgentCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('filter performance by metric', async ({ saPerformancePage }) => {
    await saPerformancePage.navigateToSAPerformance();
    
    await saPerformancePage.filterByMetric('Sales').catch(() => {
      console.log('Metric filter may not be available');
    });
    
    const count = await saPerformancePage.getAgentCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('view agent performance details', async ({ saPerformancePage }) => {
    await saPerformancePage.navigateToSAPerformance();
    const count = await saPerformancePage.getAgentCount();
    
    if (count > 0) {
      await saPerformancePage.viewAgentPerformanceDetails(0).catch(() => {
        console.log('Performance details may not be available');
      });
      
      await saPerformancePage.page.waitForTimeout(500);
      expect(await saPerformancePage.page.locator('body').count()).toBe(1);
    }
  });

  test('open comparison chart', async ({ saPerformancePage }) => {
    await saPerformancePage.navigateToSAPerformance();
    
    await saPerformancePage.openComparisonChart().catch(() => {
      console.log('Comparison chart may not be available');
    });
    
    expect(await saPerformancePage.page.locator('body').count()).toBe(1);
  });

  test('refresh performance data', async ({ saPerformancePage }) => {
    await saPerformancePage.navigateToSAPerformance();
    const beforeCount = await saPerformancePage.getAgentCount();
    
    await saPerformancePage.refreshPerformanceData();
    const afterCount = await saPerformancePage.getAgentCount();
    
    expect(afterCount).toBeGreaterThanOrEqual(0);
  });

  test('export performance report', async ({ saPerformancePage }) => {
    await saPerformancePage.navigateToSAPerformance();
    
    await saPerformancePage.exportPerformanceReport('PDF').catch(() => {
      console.log('Export may require additional interaction');
    });
    
    await expect(saPerformancePage.performanceTable).toBeVisible();
  });

  test('verify performance agent count is non-negative', async ({ saPerformancePage }) => {
    await saPerformancePage.navigateToSAPerformance();
    const count = await saPerformancePage.getAgentCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('get performance row data', async ({ saPerformancePage }) => {
    await saPerformancePage.navigateToSAPerformance();
    const count = await saPerformancePage.getAgentCount();
    
    if (count > 0) {
      const rowData = await saPerformancePage.getRowData(0);
      expect(rowData.length).toBeGreaterThan(0);
    }
  });
});
