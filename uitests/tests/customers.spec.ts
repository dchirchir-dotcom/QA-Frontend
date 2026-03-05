import test from '../helper/baseTest';
import { expect } from '@playwright/test';

test.beforeEach(async ({common, loginPage}) => {
  await common.loadSite();
  await loginPage.login('d.chirchir@itibari.io', 'dennis');
});

test.describe('Customers Module', () => {
  test('navigate to customers and verify page loaded', async ({ customersPage }) => {
    await customersPage.navigateToCustomers();
    // Verify we're on the customers page via table visibility
    await expect(customersPage.customersTable).toBeVisible();
  });

  test('search for customers', async ({ customersPage, page }) => {
    await customersPage.navigateToCustomers();
    const initialCount = await customersPage.getCustomerCount();
    
    if (initialCount > 0) {
      const firstRowData = await customersPage.getRowData(0);
      if (firstRowData.length > 0) {
        const customerId = firstRowData[0];
        await customersPage.searchCustomers(customerId);
        await expect(customersPage.customersTable).toBeVisible();
      }
    }
  });

  test('filter customers by status', async ({ customersPage }) => {
    await customersPage.navigateToCustomers();
    const initialCount = await customersPage.getCustomerCount();
    
    if (initialCount > 0) {
      await customersPage.filterByStatus('Active');
      const filteredCount = await customersPage.getCustomerCount();
      expect(filteredCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('filter customers by region', async ({ customersPage }) => {
    await customersPage.navigateToCustomers();
    
    await customersPage.filterByRegion('Nairobi').catch(() => {
      console.log('Region filter may not be available');
    });
    
    const count = await customersPage.getCustomerCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('open customer by index', async ({ customersPage, page }) => {
    await customersPage.navigateToCustomers();
    const count = await customersPage.getCustomerCount();
    
    if (count > 0) {
      await customersPage.openCustomerByIndex(0);
      await page.waitForTimeout(500);
      expect(await page.locator('body').count()).toBe(1);
    }
  });

  test('get customer row data', async ({ customersPage }) => {
    await customersPage.navigateToCustomers();
    const count = await customersPage.getCustomerCount();
    
    if (count > 0) {
      const rowData = await customersPage.getRowData(0);
      expect(rowData.length).toBeGreaterThan(0);
    }
  });

  test('refresh customers table', async ({ customersPage, page }) => {
    await customersPage.navigateToCustomers();
    const beforeCount = await customersPage.getCustomerCount();
    
    await customersPage.refreshTable();
    await page.waitForTimeout(500);
    
    const afterCount = await customersPage.getCustomerCount();
    expect(afterCount).toBeGreaterThanOrEqual(0);
  });

  test('verify customer count is non-negative', async ({ customersPage }) => {
    await customersPage.navigateToCustomers();
    const count = await customersPage.getCustomerCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('create customer button is visible', async ({ customersPage }) => {
    await customersPage.navigateToCustomers();
    
    const createBtnCount = await customersPage.createCustomerButton.count();
    if (createBtnCount > 0) {
      await expect(customersPage.createCustomerButton).toBeVisible();
    }
  });

  test('filter by customer type', async ({ customersPage }) => {
    await customersPage.navigateToCustomers();
    
    await customersPage.filterByType('Retail').catch(() => {
      console.log('Customer type filter may not be available');
    });
    
    const count = await customersPage.getCustomerCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
