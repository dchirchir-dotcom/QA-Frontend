import { expect, Locator, Page } from '@playwright/test';

export class RolesAndPermissionsPage {
  // =========================================================
  // PROPERTIES
  // =========================================================

  readonly page: Page;

  // Tabs
  readonly rolesTab:            Locator;
  readonly permissionGroupsTab: Locator;

  // Roles toolbar
  readonly addRoleButton:    Locator;
  readonly filtersButton:    Locator;
  readonly refreshButton:    Locator;

  // Permission Groups toolbar
  readonly addPermissionGroupButton: Locator;

  // Shared form actions
  readonly saveButton:    Locator;
  readonly cancelButton:  Locator;
  readonly resetButton:   Locator;

  // Role form
  readonly roleNameInput: Locator;

  // Permission Group form
  readonly permissionGroupNameInput: Locator;
  readonly permissionInput:          Locator;
  readonly addPermissionButton:      Locator;

  // Permission wizard
  readonly nextButton:            Locator;
  readonly previousButton:        Locator;
  readonly confirmAndSaveButton:  Locator;
  readonly moduleSelect:          Locator;

  // Tables
  readonly rolesTable:            Locator;
  readonly rolesRows:             Locator;
  readonly permissionGroupsTable: Locator;
  readonly permissionGroupsRows:  Locator;

  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(page: Page) {
    this.page = page;

    // Tabs
    this.rolesTab            = page.getByRole('tab', { name: 'Roles' });
    this.permissionGroupsTab = page.getByRole('tab', { name: 'Permission Groups' });

    // Roles toolbar
    this.addRoleButton  = page.locator('button:has(span:text-is("Add Role"))')
      .or(page.getByRole('button', { name: /add role/i }))
      .first();
    this.filtersButton  = page.getByRole('button', { name: /filter/i }).first();
    this.refreshButton  = page.locator('.anticon-reload').first();

    // Permission Groups toolbar
    this.addPermissionGroupButton = page.getByRole('button', { name: /add permission group/i });

    // Shared form actions
    this.saveButton   = page.getByRole('button', { name: /save/i }).first();
    this.cancelButton = page.getByRole('button', { name: /cancel/i }).first();
    this.resetButton  = page.getByRole('button', { name: /reset/i }).first();

    // Role form
    this.roleNameInput = page.getByRole('textbox', { name: /role name/i });

    // Permission Group form
    this.permissionGroupNameInput = page
      .getByRole('textbox', { name: /enter name/i })
      .or(page.getByRole('textbox', { name: /permission group name/i }));

    this.permissionInput     = page.getByRole('textbox', { name: /enter permission/i });
    this.addPermissionButton = page.getByText('+ Add');

    // Permission wizard navigation
    this.nextButton           = page.getByRole('button', { name: /next/i });
    this.previousButton       = page.getByRole('button', { name: /previous/i });
    this.confirmAndSaveButton = page.getByRole('button', { name: /confirm and save/i });
    this.moduleSelect         = page.locator('.ant-select-selection-overflow').first();

    // Roles table
    this.rolesTable = page
      .getByRole('tabpanel', { name: /^Roles$/ })
      .locator('table')
      .first()
      .or(page.locator('[id*="panel-roles"] table').first());
    this.rolesRows  = this.rolesTable.locator('tbody tr:not(.ant-table-measure-row)');

    // Permission Groups table
    this.permissionGroupsTable = page
      .getByRole('tabpanel', { name: /^Permission Groups$/ })
      .locator('table')
      .first()
      .or(page.locator('[id*="panel-permissions"] table').first());
    this.permissionGroupsRows  = this.permissionGroupsTable.locator('tbody tr:not(.ant-table-measure-row)');
  }

  // =========================================================
  // PRIVATE HELPERS
  // =========================================================

  private async slow() {
    await this.page.waitForTimeout(1000);
  }

  private async waitForNetwork() {
    await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  }

  private async gotoWithRetry(path: string) {
    let lastError: unknown;
    for (let i = 0; i < 3; i++) {
      try {
        await this.page.goto(path, { waitUntil: 'domcontentloaded' });
        return;
      } catch (error) {
        lastError = error;
        await this.page.waitForTimeout(1000);
      }
    }
    throw lastError;
  }

  private async openRowActionMenu(row: Locator) {
    const actionButton = row
      .getByRole('button')
      .or(row.locator('.anticon-ellipsis').locator('..'))
      .last();

    await actionButton.scrollIntoViewIfNeeded();
    await expect(actionButton, 'row action button should be visible').toBeVisible({ timeout: 10000 });
    await actionButton.click();
    await this.slow();
  }

  private async selectDropdownOption(option: string | RegExp, allowFallback = false) {
    const options = this.page.locator('.ant-select-item-option:not(.ant-select-item-option-disabled), .ant-dropdown-menu-item');
    let item = options.filter({ hasText: option }).first();

    if (allowFallback && !await item.isVisible({ timeout: 5000 }).catch(() => false)) {
      item = options.filter({ hasText: /\S/ }).first();
    }

    await expect(item, `option "${option}" should be visible`).toBeVisible({ timeout: 10000 });
    await item.click({ force: true });
    await this.slow();
  }

  private async clickEnabledNext(stepName: string) {
    await expect(this.nextButton, `${stepName} Next button should be enabled`).toBeEnabled({ timeout: 15000 });
    await this.nextButton.click();
    await this.waitForNetwork();
    await this.slow();
  }

  private matchesTableText(text: string, matcher: string | RegExp) {
    const normalize = (value: string) => value
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();

    const normalizedText = normalize(text);
    const matcherText = typeof matcher === 'string' ? matcher : matcher.source;
    const uniqueNumber = matcherText.match(/\d{8,}/)?.[0];
    if (uniqueNumber && text.includes(uniqueNumber)) return true;

    if (typeof matcher === 'string') {
      return normalizedText.includes(normalize(matcher));
    }

    const source = matcher.source.replace(/[_-]+/g, '\\s+');
    const flags = matcher.flags.includes('i') ? matcher.flags : `${matcher.flags}i`;
    const normalizedSource = normalize(matcher.source.replace(/\\[wWdDsS+.*?^$()[\]{}|]/g, ' '));
    return new RegExp(source, flags).test(text)
      || new RegExp(source, flags).test(normalizedText)
      || normalizedText.includes(normalizedSource);
  }

  private isDataRowText(text: string) {
    const normalized = text.replace(/\s+/g, ' ').trim().toLowerCase();
    return Boolean(normalized)
      && normalized !== 'role permissions status actions'
      && normalized !== 'name permissions status actions'
      && !normalized.startsWith('role permissions status')
      && !normalized.startsWith('name permissions status');
  }

  // =========================================================
  // NAVIGATION
  // =========================================================

  async navigate() {
    await this.gotoWithRetry('/system/user-management');
    await this.waitForNetwork();
    await expect(this.page).toHaveURL(/\/system\/user-management/);
  }

  async goToRolesTab() {
    // The sidebar "Roles" section click — matches the recorded flow
    await this.page
      .locator('div')
      .filter({ hasText: /^Roles$/ })
      .first()
      .click()
      .catch(() => {});

    await this.rolesTab.click({ force: true, timeout: 10000 });
    await this.waitForNetwork();
    await expect(this.rolesTable).toBeVisible({ timeout: 15000 });
  }

  async goToPermissionGroupsTab() {
    await this.permissionGroupsTab.click();
    await this.waitForNetwork();
    await expect(this.permissionGroupsTable).toBeVisible({ timeout: 3000 });
  }

  // =========================================================
  // ROLES — CRUD
  // =========================================================

  async addRole(name: string) {
    await this.addRoleButton.click();
    await this.slow();
    await this.roleNameInput.fill(name);
    await this.slow();

    await this.saveButton.click();
    await this.waitForNetwork();
    await this.slow();
    await this.waitForVisibleRow(new RegExp(name, 'i'));
  }

  async findRoleRow(name: string | RegExp): Promise<Locator | null> {
    return this.findVisibleRow(name);
  }

  /**
   * Toggles the active/inactive status of the role identified by `roleName`.
   * Clicks the confirm button if a dialog appears.
   */
  async toggleRoleStatus(roleName: string | RegExp) {
    const row = await this.findRoleRow(roleName);
    expect(row, `role "${roleName}" should exist in the table`).toBeTruthy();

    await this.openRowActionMenu(row!);

    const switchControl = this.page
      .getByRole('switch')
      .or(this.page.locator('.ant-switch'))
      .last();

    await expect(switchControl, 'status switch should appear').toBeVisible({ timeout: 10000 });
    await switchControl.click();
    await this.slow();

    // Confirm dialog if it appears
    const confirmButton = this.page.getByRole('button', { name: /confirm|yes|ok/i }).last();
    if (await confirmButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await confirmButton.click();
    }

    await this.waitForNetwork();
  }

  // =========================================================
  // ROLES — ADD PERMISSIONS WIZARD
  // =========================================================

  /**
   * Full permission wizard flow for a role:
   *  1. Open Add Permissions from the role row.
   *  2. Select a module from the dropdown.
   *  3. Click Next to reach the permissions step.
   *  4. Check the supplied permission checkboxes.
   *  5. Click Next → Confirm and Save.
   */
  async addPermissionsToRole(
    roleName: string | RegExp,
    moduleName: string | RegExp,
    permissions: Array<'Create' | 'Edit' | 'View' | 'Delete' | 'Add' | 'Manage'>,
  ) {
    const row = await this.findRoleRow(roleName);
    expect(row, `role "${roleName}" should exist in the table`).toBeTruthy();

    // Open "Add Permissions" — either from cell button or action menu
    const addPermissionsCell = row!.getByRole('button', { name: /add permissions/i })
      .or(row!.locator('td').filter({ hasText: /add permissions/i }))
      .first();

    if (await addPermissionsCell.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addPermissionsCell.click();
    } else {
      await this.openRowActionMenu(row!);
      await this.page.getByText(/add permissions/i).first().click();
    }

    await this.waitForNetwork();
    await this.slow();

    // Step 1 — select permission group
    await expect(this.moduleSelect, 'module select should be visible').toBeVisible({ timeout: 10000 });
    await this.moduleSelect.click();
    await this.selectDropdownOption(moduleName);

    await this.clickEnabledNext('permission group selection');

    // Step 2 — tick permission checkboxes
    for (const perm of permissions) {
      const checkbox = this.page.getByRole('checkbox', { name: perm });
      if (await checkbox.isVisible({ timeout: 3000 }).catch(() => false)) {
        const checked = await checkbox.isChecked();
        if (!checked) await checkbox.check();
      }
    }
    await this.slow();

    if (!await this.nextButton.isEnabled().catch(() => false)) {
      const visibleCheckboxes = this.page.getByRole('checkbox');
      const checkboxCount = await visibleCheckboxes.count();
      for (let i = 0; i < checkboxCount; i++) {
        const checkbox = visibleCheckboxes.nth(i);
        if (!await checkbox.isVisible().catch(() => false)) continue;
        if (!await checkbox.isChecked().catch(() => false)) {
          await checkbox.check({ force: true }).catch(async () => checkbox.click({ force: true }));
        }
        if (await this.nextButton.isEnabled().catch(() => false)) break;
      }
    }

    await this.clickEnabledNext('permission selection');

    await expect(this.confirmAndSaveButton, 'confirm button should appear').toBeVisible({ timeout: 10000 });
    await this.confirmAndSaveButton.click();
    await this.waitForNetwork();
  }

  /**
   * Navigates to a role's assigned permissions view.
   */
  async viewRolePermissions(roleName: string | RegExp) {
    const row = await this.findRoleRowWithActions(roleName);
    expect(row, `role "${roleName}" should exist in the table`).toBeTruthy();

    await this.openRowActionMenu(row!);
    const viewOption = this.page
      .locator('.ant-dropdown:not(.ant-dropdown-hidden), .ant-dropdown-menu')
      .getByText('View', { exact: true })
      .last();
    await expect(viewOption, 'View action should appear in the row menu').toBeVisible({ timeout: 10000 });
    await viewOption.click();
    await this.waitForNetwork();
  }

  // =========================================================
  // PERMISSION GROUPS — CRUD
  // =========================================================

  async addPermissionGroup(name: string) {
    await this.addPermissionGroupButton.click();
    await this.slow();

    await expect(this.permissionGroupNameInput, 'name input should appear').toBeVisible({ timeout: 10000 });
    await this.permissionGroupNameInput.fill(name);
    await this.slow();

    await this.saveButton.click();
    await this.waitForNetwork();
    await this.waitForVisibleRow(new RegExp(name, 'i'));
  }

  async findPermissionGroupRow(name: string | RegExp): Promise<Locator | null> {
    return this.findVisibleRow(name);
  }

  private async findVisibleRow(name: string | RegExp): Promise<Locator | null> {
    const rows = this.page.getByRole('row').or(this.page.locator('tbody tr:not(.ant-table-measure-row)'));
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      if (!await row.isVisible().catch(() => false)) continue;
      const text = await row.innerText().catch(() => '');
      if (!this.isDataRowText(text)) continue;
      if (this.matchesTableText(text, name)) return row;
    }
    return null;
  }

  private async waitForVisibleRow(name: string | RegExp): Promise<Locator> {
    let matchingRow: Locator | null = null;

    await expect(async () => {
      matchingRow = await this.findVisibleRow(name);
      expect(matchingRow, `row "${name}" should appear`).toBeTruthy();
    }).toPass({ timeout: 15000 });

    return matchingRow!;
  }

  /**
   * Opens the add-permissions drawer for a permission group row
   * then fills in comma-separated permission strings and saves.
   *
   * `permissionSets` is an array of comma-separated strings, each
   * submitted as a separate "+ Add" action, e.g.:
   *   ['Create, Edit, View', 'Delete, Manage']
   */
  async addPermissionsToGroup(
    groupName: string | RegExp,
    permissionSets: string[],
  ) {
    const row = await this.waitForVisibleRow(groupName);

    const addPermissionsAction = row!
      .getByText(/add permissions/i)
      .or(row!.getByRole('button', { name: /add permissions/i }))
      .first();

    await addPermissionsAction.scrollIntoViewIfNeeded();
    await expect(addPermissionsAction, 'permission group Add Permissions action should be visible').toBeVisible({ timeout: 10000 });
    await addPermissionsAction.click({ force: true });
    await this.slow();

    await expect(this.permissionInput, 'permission input should appear').toBeVisible({ timeout: 10000 });

    for (const permSet of permissionSets) {
      await this.permissionInput.click();
      await this.permissionInput.fill(permSet);
      await this.slow();

      await this.addPermissionButton.click();
      await this.slow();
    }

    await this.saveButton.click();
    await this.waitForNetwork();

    const updatedRow = await this.waitForVisibleRow(groupName);
    const expectedPermissions = permissionSets.join(',').split(',')
      .map((permission) => permission.trim())
      .filter(Boolean);
    const permissionPattern = new RegExp(expectedPermissions.join('|'), 'i');
    await expect(
      updatedRow,
      `permission group "${groupName}" should display saved permissions`,
    ).toContainText(permissionPattern, { timeout: 10000 });
  }

  /**
   * Edits the name of an existing permission group.
   */
  async editPermissionGroupName(
    currentName: string | RegExp,
    newName: string,
  ) {
    const row = await this.findPermissionGroupRow(currentName);
    expect(row, `permission group "${currentName}" should exist`).toBeTruthy();

    await this.openRowActionMenu(row!);

    const editOption = this.page
      .locator('span')
      .filter({ hasText: /^Edit$/ })
      .or(this.page.getByText('Edit', { exact: true }))
      .last();

    await editOption.click();
    await this.slow();

    const nameInput = this.page
      .getByRole('textbox', { name: /permission group name|enter name/i })
      .first();

    await expect(nameInput, 'name input should appear for editing').toBeVisible({ timeout: 10000 });
    await nameInput.fill(newName);
    await this.slow();

    await this.saveButton.click();
    await this.waitForNetwork();
  }

  /**
   * Deletes a permission group by name, confirming the dialog.
   */
  async deletePermissionGroup(name: string | RegExp) {
    const row = await this.findPermissionGroupRow(name);
    expect(row, `permission group "${name}" should exist before deletion`).toBeTruthy();

    await this.openRowActionMenu(row!);

    await this.page.getByText('Delete', { exact: true }).click();
    await this.slow();

    const confirmButton = this.page.getByRole('button', { name: /^delete$/i }).last();
    await expect(confirmButton, 'delete confirm button should appear').toBeVisible({ timeout: 5000 });
    await confirmButton.click();
    await this.waitForNetwork();
  }

  /**
   * Toggles active/inactive status of a permission group.
   */
  async togglePermissionGroupStatus(name: string | RegExp) {
    const row = await this.findPermissionGroupRow(name);
    expect(row, `permission group "${name}" should exist`).toBeTruthy();

    await this.openRowActionMenu(row!);

    const switchControl = this.page
      .getByRole('switch')
      .or(this.page.locator('.ant-switch'))
      .last();

    await expect(switchControl, 'status switch should appear').toBeVisible({ timeout: 10000 });
    await switchControl.click();

    const confirmButton = this.page.getByRole('button', { name: /confirm|yes|ok/i }).last();
    if (await confirmButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await confirmButton.click();
    }

    await this.waitForNetwork();
  }

  // =========================================================
  // VALIDATION HELPERS
  // =========================================================

  async expectSuccessToast() {
    await expect(
      this.page.locator('.ant-message-success, .ant-notification-notice-success, [class*="success"]').first(),
    ).toBeVisible({ timeout: 10000 });
  }

  async expectErrorToast() {
    await expect(
      this.page.locator('.ant-message-error, .ant-notification-notice-error, [class*="error"]').first(),
    ).toBeVisible({ timeout: 10000 });
  }

  async expectValidationErrors() {
    await expect(
      this.page.locator('.ant-form-item-explain-error, [role="alert"], .Mui-error').first(),
    ).toBeVisible({ timeout: 10000 });
  }

  async expectRoleInTable(name: string | RegExp) {
    await expect(async () => {
      const row = await this.findRoleRow(name);
      expect(row, `role "${name}" should appear in the table`).toBeTruthy();
    }).toPass({ timeout: 15000 });
  }

  async expectPermissionGroupInTable(name: string | RegExp) {
    await expect(async () => {
      const row = await this.findPermissionGroupRow(name);
      expect(row, `permission group "${name}" should appear in the table`).toBeTruthy();
    }).toPass({ timeout: 15000 });
  }

  async expectPermissionGroupNotInTable(name: string | RegExp) {
    await expect(async () => {
      const row = await this.findPermissionGroupRow(name);
      expect(row, `permission group "${name}" should have been deleted`).toBeNull();
    }).toPass({ timeout: 15000 });
  }

  private async findRoleRowWithActions(name: string | RegExp): Promise<Locator | null> {
    const rows = this.page.getByRole('row').or(this.page.locator('tbody tr:not(.ant-table-measure-row)'));
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      if (!await row.isVisible().catch(() => false)) continue;
      const text = await row.innerText().catch(() => '');
      if (!this.isDataRowText(text)) continue;
      if (!this.matchesTableText(text, name)) continue;
      if (await row.getByRole('button').count() > 0) return row;
    }
    return null;
  }

  async findFirstRoleRowWithActions(): Promise<Locator | null> {
    return this.findRoleRowWithActions(/.+/);
  }
}
