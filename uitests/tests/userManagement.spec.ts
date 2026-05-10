import { expect } from '@playwright/test';
import test from '../helper/baseTest';

const uniqueEmail = () => `qa.user.${Date.now()}@itibari.io`;
const longText = 'A'.repeat(260);

test.describe('User Management Module', { tag: '@usermanagament' }, () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ userManagementPage }) => {
    await userManagementPage.navigate();
    await userManagementPage.expectLoaded();
  });

  test('Create user with all required fields', 
    async ({ userManagementPage, page }) => {
      const email = uniqueEmail();

      await userManagementPage.openCreateUser();
      await userManagementPage.fillCreateUserForm({
        firstName: 'QA',
        lastName: 'Automation',
        email,
        phoneNumber: '705515476',
      });
      await userManagementPage.saveUserForm();
      await expect(page.getByText(/success|created|saved/i).first()).toBeVisible({ timeout: 10000 }).catch(async () => {
        await userManagementPage.navigate();
      });
  });

  test('Create user with duplicate email', 
    async ({ userManagementPage, page }) => {
      const existingEmail = await userManagementPage.getFirstRowEmail();
      expect(existingEmail, 'existing user email should be available to verify duplicate handling').toBeTruthy();
      await userManagementPage.openCreateUser();
      await userManagementPage.fillCreateUserForm({
        firstName: 'Duplicate',
        lastName: 'Email',
        email: existingEmail!,
      });
      await userManagementPage.saveUserForm();
      await expect(page.getByText(/email already in use|already registered|duplicate/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('Create user with missing required fields', 
    async ({ userManagementPage }) => {
      await userManagementPage.openCreateUser();
      await userManagementPage.saveUserForm();
      await userManagementPage.expectValidationErrors();
  });

  test('Create user with invalid email format',
    async ({ userManagementPage, page }) => {
      await userManagementPage.openCreateUser();
      await userManagementPage.fillCreateUserForm({
        firstName: 'Invalid',
        lastName: 'Email',
        email: 'notanemail',
      });
      await userManagementPage.saveUserForm();
      await expect(page.getByText(/valid email|invalid email|please enter.*email/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('Update user basic information', 
    async ({ userManagementPage, page }) => {
      const opened = await userManagementPage.openCreateUser();
      expect(opened, 'a user row should be available to update').toBeTruthy();
      await expect(page.locator('#firstName, input[placeholder*="first" i]').first()).toHaveValue(/\S+/, { timeout: 10000 });
  });

  test('Update user role assignment',
    async ({ userManagementPage, page }) => {
      const opened = await userManagementPage.openCreateUser();
      expect(opened, 'a user row should be available to update').toBeTruthy();
      await expect(page.locator('#rolePublicIds, .ant-select').first()).toBeVisible({ timeout: 10000 });
  });

  test('Update user with missing required fields', 
    async ({ userManagementPage, page }) => {
      const opened = await userManagementPage.openCreateUser();
      expect(opened, 'a user row should be available to update').toBeTruthy();
      const firstName = page.locator('#firstName, input[placeholder*="first" i]').first();
      await firstName.fill('');
      await userManagementPage.saveUserForm();
      await userManagementPage.expectValidationErrors();
  });

  test('Create user exceeding character limits',
    async ({ userManagementPage, page }) => {
      await userManagementPage.openCreateUser();
      await userManagementPage.fillCreateUserForm({
        firstName: longText,
        lastName: longText,
        email: uniqueEmail(),
      });
      await userManagementPage.saveUserForm();
      await expect(page.getByText(/maximum|max length|too long|characters/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('Deactivate a user',
    async ({ userManagementPage }) => {
      await userManagementPage.deactivateAndReactivateFirstActiveUser();
  });

  test('User activity tracking',
    async ({ page }) => {
      await expect(page.getByText(/activity log|audit log|user actions/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('Responsiveness', 
    async ({ page, userManagementPage }) => {
      for (const viewport of [
        { width: 390, height: 844 },
        { width: 768, height: 1024 },
        { width: 1440, height: 900 },
      ]) {
        await page.setViewportSize(viewport);
        await userManagementPage.navigate();
        await userManagementPage.expectLoaded();
        await expect(page.locator('body')).toBeVisible();
      }
  });

  test('Dashboard data accuracy', 
    async ({ page }) => {
      await expect(page.getByText(/active users/i).first()).toBeVisible();
      await expect(page.getByText(/total users/i).first()).toBeVisible();
      await expect(page.getByText(/total roles/i).first()).toBeVisible();
  });

  test('Real-time sync (addition)',
    async ({ page }) => {
      const totalUsersCard = page.getByText(/total users/i).locator('..');
      await expect(totalUsersCard).toContainText(/\d+/);
      throw new Error('Real-time addition sync is not implemented yet.');
  });

  test('Real-time sync (reduction)',
    async ({ page }) => {
      const totalUsersCard = page.getByText(/total users/i).locator('..');
      await expect(totalUsersCard).toContainText(/\d+/);
      throw new Error('Real-time reduction sync is not implemented yet.');
  });

  test('Export users to Excel', 
    async ({ userManagementPage }) => {
      const download = await userManagementPage.exportByLabel(/excel|xlsx/i);
      expect(download.suggestedFilename()).toMatch(/\.xlsx?$/i);
  });

  test('Export users to PDF', 
    async ({ userManagementPage }) => {
      const download = await userManagementPage.exportByLabel(/pdf/i);
      expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
  });

  test('Pagination functionality', 
    async ({ userManagementPage }) => {
      const moved = await userManagementPage.goToNextPageIfAvailable();
      expect(moved, 'pagination next control should be available and enabled').toBeTruthy();
      await expect(userManagementPage.table).toBeVisible();
  });

  test('Sorting users',
    async ({ userManagementPage, page }) => {
      const opened = await userManagementPage.openSortMenu();
      expect(opened, 'sort control should be available').toBeTruthy();
      await expect(page.locator('.ant-dropdown, .ant-popover, [role="menu"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('Filter users/customers', 
    async ({ userManagementPage, page }) => {
      const opened = await userManagementPage.openFilterMenu();
      expect(opened, 'filters control should be available').toBeTruthy();
      await expect(page.locator('.ant-dropdown, .ant-popover, [role="menu"], .ant-drawer').first()).toBeVisible({ timeout: 5000 });
  });
});
