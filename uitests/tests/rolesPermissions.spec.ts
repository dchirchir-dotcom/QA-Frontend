import { expect } from '@playwright/test';
import test from '../helper/baseTest';

const uniqueName = (prefix: string) => `${prefix}_${Date.now()}`;

    test.describe('Roles & Permission Groups Module', () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ rolesAndPermissionsPage }) => {
    await rolesAndPermissionsPage.navigate();
    await rolesAndPermissionsPage.goToRolesTab();
  });

  test.describe('Roles', () => {

    test('Add a new role with a valid name',
      async ({ rolesAndPermissionsPage }) => {
        const name = uniqueName('QA_Roles');

        await rolesAndPermissionsPage.addRole(name);
        // await rolesAndPermissionsPage.expectRoleInTable(new RegExp(name, 'i'));
      }
    );

    test('Add a role with a missing name shows validation error',
      async ({ rolesAndPermissionsPage }) => {
        await rolesAndPermissionsPage.addRoleButton.click();
        await rolesAndPermissionsPage.saveButton.click();
        await rolesAndPermissionsPage.expectValidationErrors();
      }
    );

    test('Deactivate an active role',
      async ({ rolesAndPermissionsPage, page }) => {
        const name = uniqueName('QA_Deactivate');
        await rolesAndPermissionsPage.addRole(name);
        await rolesAndPermissionsPage.expectRoleInTable(new RegExp(name, 'i'));

        await rolesAndPermissionsPage.toggleRoleStatus(new RegExp(name, 'i'));

        // Verify the row now shows an inactive status badge
        const row = await rolesAndPermissionsPage.findRoleRow(new RegExp(name, 'i'));
        expect(row, 'role row should still be visible after deactivation').toBeTruthy();
        await expect(row!).toContainText(/inactive/i, { timeout: 10000 });
      }
    );

    test('Reactivate a deactivated role',
      async ({ rolesAndPermissionsPage }) => {
        const name = uniqueName('QA_Reactivate');
        await rolesAndPermissionsPage.addRole(name);
        await rolesAndPermissionsPage.toggleRoleStatus(new RegExp(name, 'i'));

        // Deactivated — now reactivate
        await rolesAndPermissionsPage.toggleRoleStatus(new RegExp(name, 'i'));

        const row = await rolesAndPermissionsPage.findRoleRow(new RegExp(name, 'i'));
        expect(row, 'role row should be visible after reactivation').toBeTruthy();
        await expect(row!).toContainText(/active/i, { timeout: 10000 });
        await expect(row!).not.toContainText(/inactive/i);
      }
    );

    test('Add permissions to a role via the wizard',
      async ({ rolesAndPermissionsPage }) => {
        const name = uniqueName('QA_Permissions');
        await rolesAndPermissionsPage.addRole(name);
        await rolesAndPermissionsPage.expectRoleInTable(new RegExp(name, 'i'));

        await rolesAndPermissionsPage.addPermissionsToRole(
          new RegExp(name, 'i'),
          /warehouse/i,
          ['Create', 'Edit', 'View'],
        );

        // After saving, user should be back on the roles list
        await expect(rolesAndPermissionsPage.rolesTable).toBeVisible({ timeout: 15000 });
      }
    );

    test('Add permissions to an existing role with multiple permission types',
      async ({ rolesAndPermissionsPage }) => {
        const name = uniqueName('QA_MultiPerm');
        await rolesAndPermissionsPage.addRole(name);

        await rolesAndPermissionsPage.addPermissionsToRole(
          new RegExp(name, 'i'),
          /products/i,
          ['Create', 'Edit', 'View', 'Delete', 'Manage'],
        );

        await expect(rolesAndPermissionsPage.rolesTable).toBeVisible({ timeout: 15000 });
      }
    );

    test('View assigned permissions for a role',
      async ({ rolesAndPermissionsPage, page }) => {
        // Use the first existing role in the table
        const row = await rolesAndPermissionsPage.findRoleRow(/.+/);
        expect(row, 'at least one role should exist in the table').toBeTruthy();
        const roleText = await row!.innerText();
        const roleName = roleText.split(/\s+/).slice(0, 2).join(' ');

        await rolesAndPermissionsPage.viewRolePermissions(new RegExp(roleName, 'i'));

        await expect(
          page.locator('div').filter({ hasText: /assigned permissions/i }).first(),
        ).toBeVisible({ timeout: 10000 });
      }
    );

  });

  // =========================================================
  // PERMISSION GROUPS
  // =========================================================

  test.describe('Permission Groups', () => {

    test.beforeEach(async ({ rolesAndPermissionsPage }) => {
      await rolesAndPermissionsPage.goToPermissionGroupsTab();
    });

    test('Add a new permission group with a valid name',
      async ({ rolesAndPermissionsPage }) => {
        const name = uniqueName('QA_Group');

        await rolesAndPermissionsPage.addPermissionGroup(name);
        await rolesAndPermissionsPage.expectPermissionGroupInTable(new RegExp(name, 'i'));
      }
    );

    test('Add a permission group with a missing name shows validation error',
      async ({ rolesAndPermissionsPage }) => {
        await rolesAndPermissionsPage.addPermissionGroupButton.click();
        await rolesAndPermissionsPage.saveButton.click();
        await rolesAndPermissionsPage.expectValidationErrors();
      }
    );

    test('Add permissions to a permission group',
      async ({ rolesAndPermissionsPage }) => {
        const name = uniqueName('QA_GroupPerms');
        await rolesAndPermissionsPage.addPermissionGroup(name);
        await rolesAndPermissionsPage.expectPermissionGroupInTable(new RegExp(name, 'i'));

        await rolesAndPermissionsPage.addPermissionsToGroup(
          new RegExp(name, 'i'),
          ['Create, Edit, View'],
        );

        // Row should now show permission tags
        const row = await rolesAndPermissionsPage.findPermissionGroupRow(new RegExp(name, 'i'));
        expect(row, 'permission group row should still exist after adding permissions').toBeTruthy();
        await expect(row!).toContainText(/create|edit|view/i, { timeout: 10000 });
      }
    );

    test('Add multiple permission sets to a group in one session',
      async ({ rolesAndPermissionsPage }) => {
        const name = uniqueName('QA_MultiSets');
        await rolesAndPermissionsPage.addPermissionGroup(name);

        await rolesAndPermissionsPage.addPermissionsToGroup(
          new RegExp(name, 'i'),
          [
            'Create, Edit, View',
            'Delete, Manage',
          ],
        );

        const row = await rolesAndPermissionsPage.findPermissionGroupRow(new RegExp(name, 'i'));
        expect(row, 'row should exist after adding multiple permission sets').toBeTruthy();
      }
    );

    test('Edit a permission group name',
      async ({ rolesAndPermissionsPage }) => {
        const original = uniqueName('QA_EditBefore');
        const updated  = uniqueName('QA_EditAfter');

        await rolesAndPermissionsPage.addPermissionGroup(original);
        await rolesAndPermissionsPage.expectPermissionGroupInTable(new RegExp(original, 'i'));

        await rolesAndPermissionsPage.editPermissionGroupName(
          new RegExp(original, 'i'),
          updated,
        );

        await rolesAndPermissionsPage.expectPermissionGroupInTable(new RegExp(updated, 'i'));
      }
    );

    test('Delete a permission group',
      async ({ rolesAndPermissionsPage }) => {
        const name = uniqueName('QA_Delete');

        await rolesAndPermissionsPage.addPermissionGroup(name);
        await rolesAndPermissionsPage.expectPermissionGroupInTable(new RegExp(name, 'i'));

        await rolesAndPermissionsPage.deletePermissionGroup(new RegExp(name, 'i'));
        await rolesAndPermissionsPage.expectPermissionGroupNotInTable(new RegExp(name, 'i'));
      }
    );

    test('Deactivate a permission group',
      async ({ rolesAndPermissionsPage }) => {
        const name = uniqueName('QA_Deactivate');
        await rolesAndPermissionsPage.addPermissionGroup(name);

        await rolesAndPermissionsPage.togglePermissionGroupStatus(new RegExp(name, 'i'));

        const row = await rolesAndPermissionsPage.findPermissionGroupRow(new RegExp(name, 'i'));
        expect(row, 'row should exist after deactivation').toBeTruthy();
        await expect(row!).toContainText(/inactive/i, { timeout: 10000 });
      }
    );

    test('Reactivate a permission group',
      async ({ rolesAndPermissionsPage }) => {
        const name = uniqueName('QA_Reactivate');
        await rolesAndPermissionsPage.addPermissionGroup(name);
        await rolesAndPermissionsPage.togglePermissionGroupStatus(new RegExp(name, 'i'));

        // Now reactivate
        await rolesAndPermissionsPage.togglePermissionGroupStatus(new RegExp(name, 'i'));

        const row = await rolesAndPermissionsPage.findPermissionGroupRow(new RegExp(name, 'i'));
        expect(row, 'row should exist after reactivation').toBeTruthy();
        await expect(row!).toContainText(/active/i, { timeout: 10000 });
        await expect(row!).not.toContainText(/inactive/i);
      }
    );

    test('Reset clears unsaved permission entries',
      async ({ rolesAndPermissionsPage, page }) => {
        const name = uniqueName('QA_Reset');
        await rolesAndPermissionsPage.addPermissionGroup(name);

        // Open the group's permissions drawer
        const row = await rolesAndPermissionsPage.findPermissionGroupRow(new RegExp(name, 'i'));
        const editIcon = row!.locator('span[class*="edit"], .anticon-edit, span:nth-child(2)').first();
        await editIcon.click();
        await page.waitForTimeout(1000);

        // Type some entries, then reset
        await rolesAndPermissionsPage.permissionInput.fill('ShouldBeCleared, NotSaved');
        await rolesAndPermissionsPage.addPermissionButton.click();
        await page.waitForTimeout(500);

        await rolesAndPermissionsPage.resetButton.click();
        await page.waitForTimeout(500);

        // Confirm reset again if a second confirmation appeared
        const secondReset = page.getByRole('button', { name: /reset/i }).last();
        if (await secondReset.isVisible({ timeout: 2000 }).catch(() => false)) {
          await secondReset.click();
        }

        // Input should be cleared
        await expect(rolesAndPermissionsPage.permissionInput).toHaveValue('');
      }
    );

  });

  // =========================================================
  // EXPORT
  // =========================================================

  test.describe('Export', () => {

    test('Export roles to Excel',
      async ({ rolesAndPermissionsPage, page }) => {
        // The export icon is within the roles tab panel
        const excelExportIcon = page
          .locator('[id*="panel-roles"] .ant-pro-card-extra .anticon')
          .last();

        await expect(excelExportIcon, 'Excel export icon should be visible').toBeVisible({ timeout: 10000 });

        const [download] = await Promise.all([
          page.waitForEvent('download', { timeout: 30000 }),
          excelExportIcon.click(),
        ]);

        expect(
          download.suggestedFilename(),
          'downloaded file should be an Excel file',
        ).toMatch(/\.xlsx?$/i);
      }
    );

    test('Export roles to PDF',
      async ({ rolesAndPermissionsPage, page }) => {
        const pdfExportIcon = page
          .locator('[id*="panel-roles"] .ant-pro-card-extra .anticon')
          .first();

        await expect(pdfExportIcon, 'PDF export icon should be visible').toBeVisible({ timeout: 10000 });

        const [download] = await Promise.all([
          page.waitForEvent('download', { timeout: 30000 }),
          pdfExportIcon.click(),
        ]);

        expect(
          download.suggestedFilename(),
          'downloaded file should be a PDF',
        ).toMatch(/\.pdf$/i);
      }
    );

  });

});