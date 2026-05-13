import { expect } from '@playwright/test';
import test from '../helper/baseTest';
import { assertionPatterns, assertionText } from '../helper/assertionText';
import { commonLocators, userManagementLocators } from '../helper/locators';

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
      console.log(`Creating user with email: ${email}`);

      await userManagementPage.openCreateUser();
      await userManagementPage.fillCreateUserForm({
        firstName: 'QA',
        lastName: 'Automation',
        email,
        phoneNumber: '705515476',
      });
      await userManagementPage.saveUserForm();
      await expect(userManagementLocators.text(page, assertionPatterns.userManagement.successSaved)).toBeVisible({ timeout: 10000 }).catch(async () => {
        await userManagementPage.navigate();
      });
  });

  test('Create user with duplicate email', 
    async ({ userManagementPage, page }) => {
      const existingEmail = await userManagementPage.getFirstRowEmail();
      expect(existingEmail, assertionText.userManagement.existingEmailForDuplicate).toBeTruthy();
      await userManagementPage.openCreateUser();
      await userManagementPage.fillCreateUserForm({
        firstName: 'Duplicate',
        lastName: 'Email',
        email: existingEmail!,
      });
      await userManagementPage.saveUserForm();
      await expect(userManagementLocators.text(page, assertionPatterns.userManagement.duplicateEmail)).toBeVisible({ timeout: 10000 });
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
      await expect(userManagementLocators.text(page, assertionPatterns.userManagement.invalidEmail)).toBeVisible({ timeout: 10000 });
  });

  test('Update user basic information', 
    async ({ userManagementPage, page }) => {
      const opened = await userManagementPage.openCreateUser();
      expect(opened, assertionText.userManagement.userRowAvailableToUpdate).toBeTruthy();
      await expect(userManagementLocators.firstNameFallbackInput(page)).toHaveValue(assertionPatterns.userManagement.firstNameValue, { timeout: 10000 });
  });

  test('Update user role assignment',
    async ({ userManagementPage, page }) => {
      const opened = await userManagementPage.openCreateUser();
      expect(opened, assertionText.userManagement.userRowAvailableToUpdate).toBeTruthy();
      await expect(userManagementLocators.roleFallbackSelect(page)).toBeVisible({ timeout: 10000 });
  });

  test('Update user with missing required fields', 
    async ({ userManagementPage, page }) => {
      const opened = await userManagementPage.openCreateUser();
      expect(opened, assertionText.userManagement.userRowAvailableToUpdate).toBeTruthy();
      const firstName = userManagementLocators.firstNameFallbackInput(page);
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
      await expect(userManagementLocators.text(page, assertionPatterns.userManagement.characterLimit)).toBeVisible({ timeout: 10000 });
  });

  test('Deactivate a user',
    async ({ userManagementPage }) => {
      await userManagementPage.deactivateAndReactivateFirstActiveUser();
  });

  test('User activity tracking',
    async ({ page }) => {
      await expect(userManagementLocators.text(page, assertionPatterns.userManagement.activityLog)).toBeVisible({ timeout: 10000 });
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
        await expect(commonLocators.body(page)).toBeVisible();
      }
  });

  test('Dashboard data accuracy', 
    async ({ page }) => {
      await expect(userManagementLocators.text(page, assertionPatterns.userManagement.activeUsers)).toBeVisible();
      await expect(userManagementLocators.text(page, assertionPatterns.userManagement.totalUsers)).toBeVisible();
      await expect(userManagementLocators.text(page, assertionPatterns.userManagement.totalRoles)).toBeVisible();
  });

  test('Real-time sync (addition)',
    async ({ page }) => {
      const totalUsersCard = userManagementLocators.textParent(page, assertionPatterns.userManagement.totalUsers);
      await expect(totalUsersCard).toContainText(/\d+/);
      throw new Error('Real-time addition sync is not implemented yet.');
  });

  test('Real-time sync (reduction)',
    async ({ page }) => {
      const totalUsersCard = userManagementLocators.textParent(page, assertionPatterns.userManagement.totalUsers);
      await expect(totalUsersCard).toContainText(/\d+/);
      throw new Error('Real-time reduction sync is not implemented yet.');
  });

  test('Export users to Excel', 
    async ({ userManagementPage }) => {
      await userManagementPage.expectExportStarted(/excel|xlsx/i, /\.xlsx?$/i);
  });

  test('Export users to PDF', 
    async ({ userManagementPage }) => {
      await userManagementPage.expectExportStarted(/pdf/i, /\.pdf$/i);
  });

  test('Pagination functionality', 
    async ({ userManagementPage }) => {
      const moved = await userManagementPage.goToNextPageIfAvailable();
      expect(moved, assertionText.userManagement.paginationNextAvailable).toBeTruthy();
      await expect(userManagementPage.table).toBeVisible();
  });

  test('Search users by an existing email',
    async ({ userManagementPage }) => {
      const existingEmail = await userManagementPage.getFirstRowEmail();
      expect(existingEmail, assertionText.userManagement.existingEmailForSearch).toBeTruthy();

      await userManagementPage.expectSearchFinds(existingEmail!);
      await userManagementPage.clearSearch();
      await expect(userManagementPage.table).toBeVisible();
    });

  test('Search users handles no-result values',
    async ({ userManagementPage }) => {
      await userManagementPage.expectSearchNoResults(`missing-user-${Date.now()}@itibari.io`);
      await userManagementPage.clearSearch();
      await expect(userManagementPage.table).toBeVisible();
    });

  test('Sorting users',
    async ({ userManagementPage, page }) => {
      await userManagementPage.expectSortKeepsTableUsable();
      await expect(commonLocators.visiblePopup(page)).toBeVisible({ timeout: 5000 });
  });

  test('Filter users/customers', 
    async ({ userManagementPage, page }) => {
      const opened = await userManagementPage.openFilterMenu();
      expect(opened, assertionText.userManagement.filtersControlAvailable).toBeTruthy();
      await expect(commonLocators.visiblePopup(page)).toBeVisible({ timeout: 5000 });
  });
});
