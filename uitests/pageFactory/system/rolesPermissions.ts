import { expect, Locator, Page } from '@playwright/test';

type Permission = 'Create' | 'Edit' | 'View' | 'Delete' | 'Add' | 'Manage';

const HEADER_ROW_TEXTS = [
  'role permissions status actions',
  'name permissions status actions',
];

export class RolesAndPermissionsPage {
  readonly page: Page;

  readonly rolesTab:            Locator;
  readonly permissionGroupsTab: Locator;

  readonly addRoleButton: Locator;
  readonly filtersButton: Locator;
  readonly refreshButton: Locator;

  readonly addPermissionGroupButton: Locator;

  readonly saveButton:   Locator;
  readonly cancelButton: Locator;
  readonly resetButton:  Locator;

  readonly roleNameInput: Locator;

  readonly permissionGroupNameInput: Locator;
  readonly permissionInput:          Locator;
  readonly addPermissionButton:      Locator;

  readonly nextButton:           Locator;
  readonly previousButton:       Locator;
  readonly confirmAndSaveButton: Locator;
  readonly moduleSelect:         Locator;

  readonly rolesTable:            Locator;
  readonly rolesRows:             Locator;
  readonly permissionGroupsTable: Locator;
  readonly permissionGroupsRows:  Locator;

  constructor(page: Page) {
    this.page = page;

    this.rolesTab            = page.getByRole('tab', { name: 'Roles' });
    this.permissionGroupsTab = page.getByRole('tab', { name: 'Permission Groups' });

    this.addRoleButton = page
      .locator('button:has(span:text-is("Add Role"))')
      .or(page.getByRole('button', { name: /add role/i }))
      .first();
    this.filtersButton = page.getByRole('button', { name: /filter/i }).first();
    this.refreshButton = page.locator('.anticon-reload').first();

    this.addPermissionGroupButton = page.getByRole('button', { name: /add permission group/i });

    this.saveButton   = page.getByRole('button', { name: /save/i }).first();
    this.cancelButton = page.getByRole('button', { name: /cancel/i }).first();
    this.resetButton  = page.getByRole('button', { name: /reset/i }).first();

    this.roleNameInput = page.getByRole('textbox', { name: /role name/i });

    this.permissionGroupNameInput = page
      .getByRole('textbox', { name: /enter name/i })
      .or(page.getByRole('textbox', { name: /permission group name/i }));
    this.permissionInput     = page.getByRole('textbox', { name: /enter permission/i });
    this.addPermissionButton = page.getByText('+ Add');

    this.nextButton           = page.getByRole('button', { name: /next/i });
    this.previousButton       = page.getByRole('button', { name: /previous/i });
    this.confirmAndSaveButton = page.getByRole('button', { name: /confirm and save/i });
    this.moduleSelect         = page.locator('.ant-select-selection-overflow').first();

    this.rolesTable = page
      .getByRole('tabpanel', { name: /^Roles$/ })
      .locator('table')
      .first()
      .or(page.locator('[id*="panel-roles"] table').first());
    this.rolesRows  = this.rolesTable.locator('tbody tr:not(.ant-table-measure-row)');

    this.permissionGroupsTable = page
      .getByRole('tabpanel', { name: /^Permission Groups$/ })
      .locator('table')
      .first()
      .or(page.locator('[id*="panel-permissions"] table').first());
    this.permissionGroupsRows  = this.permissionGroupsTable.locator('tbody tr:not(.ant-table-measure-row)');
  }

  async navigate() {
    await this.gotoWithRetry('/system/user-management');
    await this.waitForNetwork();
    await expect(this.page).toHaveURL(/\/system\/user-management/);
  }

  async goToRolesTab() {
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

  async addRole(name: string) {
    await this.addRoleButton.click();
    await this.pause();

    await this.roleNameInput.fill(name);
    await this.pause();

    await this.saveButton.click();
    await this.waitForNetwork();
    await this.pause();

    await this.waitForRowToAppear(new RegExp(name, 'i'));
  }

  async toggleRoleStatus(roleName: string | RegExp) {
    const row = await this.findRoleRow(roleName);
    expect(row, `role "${roleName}" should exist in the table`).toBeTruthy();

    await this.openRowActionMenu(row!);

    const statusSwitch = this.page
      .getByRole('switch')
      .or(this.page.locator('.ant-switch'))
      .last();

    await expect(statusSwitch, 'status switch should appear').toBeVisible({ timeout: 10000 });
    await statusSwitch.click();
    await this.pause();

    await this.confirmDialogIfVisible();
    await this.waitForNetwork();
  }

  async addPermissionsToRole(
    roleName: string | RegExp,
    moduleName: string | RegExp,
    permissions: Permission[],
  ) {
    const row = await this.findRoleRow(roleName);
    expect(row, `role "${roleName}" should exist in the table`).toBeTruthy();

    await this.openAddPermissionsPanel(row!);

    await expect(this.moduleSelect, 'module select should be visible').toBeVisible({ timeout: 10000 });
    await this.moduleSelect.click();
    await this.selectDropdownOption(moduleName);
    await this.clickNextWhenEnabled('module selection');

    await this.checkPermissions(permissions);
    await this.clickNextWhenEnabled('permission selection');

    await expect(this.confirmAndSaveButton, 'confirm button should appear').toBeVisible({ timeout: 10000 });
    await this.confirmAndSaveButton.click();
    await this.waitForNetwork();
  }

  async viewRolePermissions(roleName: string | RegExp) {
    const row = await this.findRoleRowWithActions(roleName);
    expect(row, `role "${roleName}" should exist in the table`).toBeTruthy();

    await this.openRowActionMenu(row!);

    const viewOption = this.page
      .locator('.ant-dropdown:not(.ant-dropdown-hidden), .ant-dropdown-menu')
      .getByText('View', { exact: true })
      .last();

    await expect(viewOption, 'View option should appear in the row menu').toBeVisible({ timeout: 10000 });
    await viewOption.click();
    await this.waitForNetwork();
  }

  async addPermissionGroup(name: string) {
    await this.addPermissionGroupButton.click();
    await this.pause();

    await expect(this.permissionGroupNameInput, 'name input should appear').toBeVisible({ timeout: 10000 });
    await this.permissionGroupNameInput.fill(name);
    await this.pause();

    await this.saveButton.click();
    await this.waitForNetwork();
    await this.waitForRowToAppear(new RegExp(name, 'i'));
  }

  async addPermissionsToGroup(groupName: string | RegExp, permissionSets: string[]) {
    const row = await this.waitForRowToAppear(groupName);

    const addPermissionsAction = row
      .getByText(/add permissions/i)
      .or(row.getByRole('button', { name: /add permissions/i }))
      .first();

    await addPermissionsAction.scrollIntoViewIfNeeded();
    await expect(addPermissionsAction, 'Add Permissions action should be visible').toBeVisible({ timeout: 10000 });
    await addPermissionsAction.click({ force: true });
    await this.pause();

    await expect(this.permissionInput, 'permission input should appear').toBeVisible({ timeout: 10000 });

    for (const permSet of permissionSets) {
      await this.permissionInput.click();
      await this.permissionInput.fill(permSet);
      await this.pause();
      await this.addPermissionButton.click();
      await this.pause();
    }

    await this.saveButton.click();
    await this.waitForNetwork();

    const updatedRow        = await this.waitForRowToAppear(groupName);
    const allPermissions    = permissionSets.join(',').split(',').map((p) => p.trim()).filter(Boolean);
    const permissionPattern = new RegExp(allPermissions.join('|'), 'i');

    await expect(
      updatedRow,
      `permission group "${groupName}" should display saved permissions`,
    ).toContainText(permissionPattern, { timeout: 10000 });
  }

  async editPermissionGroupName(currentName: string | RegExp, newName: string) {
    const row = await this.findPermissionGroupRow(currentName);
    expect(row, `permission group "${currentName}" should exist`).toBeTruthy();

    await this.openRowActionMenu(row!);

    const editOption = this.page
      .locator('span')
      .filter({ hasText: /^Edit$/ })
      .or(this.page.getByText('Edit', { exact: true }))
      .last();

    await editOption.click();
    await this.pause();

    const nameInput = this.page
      .getByRole('textbox', { name: /permission group name|enter name/i })
      .first();

    await expect(nameInput, 'name input should appear for editing').toBeVisible({ timeout: 10000 });
    await nameInput.fill(newName);
    await this.pause();

    await this.saveButton.click();
    await this.waitForNetwork();
  }

  async deletePermissionGroup(name: string | RegExp) {
    const row = await this.findPermissionGroupRow(name);
    expect(row, `permission group "${name}" should exist before deletion`).toBeTruthy();

    await this.openRowActionMenu(row!);
    await this.page.getByText('Delete', { exact: true }).click();
    await this.pause();

    const confirmDeleteButton = this.page.getByRole('button', { name: /^delete$/i }).last();
    await expect(confirmDeleteButton, 'delete confirm button should appear').toBeVisible({ timeout: 5000 });
    await confirmDeleteButton.click();
    await this.waitForNetwork();
  }

  async togglePermissionGroupStatus(name: string | RegExp) {
    const row = await this.findPermissionGroupRow(name);
    expect(row, `permission group "${name}" should exist`).toBeTruthy();

    await this.openRowActionMenu(row!);

    const statusSwitch = this.page
      .getByRole('switch')
      .or(this.page.locator('.ant-switch'))
      .last();

    await expect(statusSwitch, 'status switch should appear').toBeVisible({ timeout: 10000 });
    await statusSwitch.click();

    await this.confirmDialogIfVisible();
    await this.waitForNetwork();
  }

  async findRoleRow(name: string | RegExp): Promise<Locator | null> {
    return this.findRow(name);
  }

  async findFirstRoleRowWithActions(): Promise<Locator | null> {
    return this.findRoleRowWithActions(/.+/);
  }

  async findPermissionGroupRow(name: string | RegExp): Promise<Locator | null> {
    return this.findRow(name);
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

  async expectSuccessToast() {
    await expect(
      this.page
        .locator('.ant-message-success, .ant-notification-notice-success, [class*="success"]')
        .first(),
    ).toBeVisible({ timeout: 10000 });
  }

  async expectErrorToast() {
    await expect(
      this.page
        .locator('.ant-message-error, .ant-notification-notice-error, [class*="error"]')
        .first(),
    ).toBeVisible({ timeout: 10000 });
  }

  async expectValidationErrors() {
    await expect(
      this.page
        .locator('.ant-form-item-explain-error, [role="alert"], .Mui-error')
        .first(),
    ).toBeVisible({ timeout: 10000 });
  }

  private async pause() {
    await this.page.waitForTimeout(1000);
  }

  private async waitForNetwork() {
    await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  }

  private async gotoWithRetry(path: string, retries = 3) {
    let lastError: unknown;
    for (let attempt = 0; attempt < retries; attempt++) {
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
    await this.pause();
  }

  private async selectDropdownOption(option: string | RegExp, fallbackToFirst = false) {
    const allOptions = this.page.locator(
      '.ant-select-item-option:not(.ant-select-item-option-disabled), .ant-dropdown-menu-item',
    );
    let target = allOptions.filter({ hasText: option }).first();

    const isVisible = () => target.isVisible({ timeout: 5000 }).catch(() => false);
    if (fallbackToFirst && !(await isVisible())) {
      target = allOptions.filter({ hasText: /\S/ }).first();
    }

    await expect(target, `option "${option}" should be visible`).toBeVisible({ timeout: 10000 });
    await target.click({ force: true });
    await this.pause();
  }

  private async clickNextWhenEnabled(stepName: string) {
    await expect(this.nextButton, `"${stepName}" Next button should be enabled`).toBeEnabled({ timeout: 15000 });
    await this.nextButton.click();
    await this.waitForNetwork();
    await this.pause();
  }

  private async confirmDialogIfVisible() {
    const confirmButton = this.page.getByRole('button', { name: /confirm|yes|ok/i }).last();
    if (await confirmButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await confirmButton.click();
    }
  }

  private async openAddPermissionsPanel(row: Locator) {
    const inlineButton = row
      .getByRole('button', { name: /add permissions/i })
      .or(row.locator('td').filter({ hasText: /add permissions/i }))
      .first();

    if (await inlineButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await inlineButton.click();
    } else {
      await this.openRowActionMenu(row);
      await this.page.getByText(/add permissions/i).first().click();
    }

    await this.waitForNetwork();
    await this.pause();
  }

  private async checkPermissions(permissions: Permission[]) {
    for (const permission of permissions) {
      const checkbox = this.page.getByRole('checkbox', { name: permission });
      if (await checkbox.isVisible({ timeout: 3000 }).catch(() => false)) {
        if (!await checkbox.isChecked()) {
          await checkbox.check();
        }
      }
    }

    await this.pause();

    if (await this.nextButton.isEnabled().catch(() => false)) return;

    const allCheckboxes = this.page.getByRole('checkbox');
    const total         = await allCheckboxes.count();

    for (let i = 0; i < total; i++) {
      const checkbox = allCheckboxes.nth(i);
      if (!await checkbox.isVisible().catch(() => false)) continue;
      if (!await checkbox.isChecked().catch(() => false)) {
        await checkbox.check({ force: true }).catch(() => checkbox.click({ force: true }));
      }
      if (await this.nextButton.isEnabled().catch(() => false)) break;
    }
  }

  private textMatchesName(text: string, matcher: string | RegExp): boolean {
    const normalize = (value: string) =>
      value.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();

    const normalizedText = normalize(text);
    const matcherSource  = typeof matcher === 'string' ? matcher : matcher.source;
    const uniqueNumber   = matcherSource.match(/\d{8,}/)?.[0];

    if (uniqueNumber && text.includes(uniqueNumber)) return true;

    if (typeof matcher === 'string') {
      return normalizedText.includes(normalize(matcher));
    }

    const flags          = matcher.flags.includes('i') ? matcher.flags : `${matcher.flags}i`;
    const relaxedPattern = matcher.source.replace(/[_-]+/g, '\\s+');
    const regex          = new RegExp(relaxedPattern, flags);
    const normalizedPat  = normalize(matcher.source.replace(/\\[wWdDsS+.*?^$()[\]{}|]/g, ' '));

    return regex.test(text) || regex.test(normalizedText) || normalizedText.includes(normalizedPat);
  }

  private isDataRow(rowText: string): boolean {
    const normalized = rowText.replace(/\s+/g, ' ').trim().toLowerCase();
    return (
      Boolean(normalized)
      && !HEADER_ROW_TEXTS.some((header) => normalized === header)
      && !HEADER_ROW_TEXTS.some((header) => normalized.startsWith(header))
    );
  }

  private async findRow(name: string | RegExp): Promise<Locator | null> {
    const rows  = this.page.getByRole('row').or(this.page.locator('tbody tr:not(.ant-table-measure-row)'));
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const row  = rows.nth(i);
      if (!await row.isVisible().catch(() => false)) continue;

      const text = await row.innerText().catch(() => '');
      if (!this.isDataRow(text)) continue;
      if (this.textMatchesName(text, name)) return row;
    }

    return null;
  }

  private async findRoleRowWithActions(name: string | RegExp): Promise<Locator | null> {
    const rows  = this.page.getByRole('row').or(this.page.locator('tbody tr:not(.ant-table-measure-row)'));
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const row  = rows.nth(i);
      if (!await row.isVisible().catch(() => false)) continue;

      const text = await row.innerText().catch(() => '');
      if (!this.isDataRow(text)) continue;
      if (!this.textMatchesName(text, name)) continue;
      if (await row.getByRole('button').count() > 0) return row;
    }

    return null;
  }

  private async waitForRowToAppear(name: string | RegExp): Promise<Locator> {
    let found: Locator | null = null;

    await expect(async () => {
      found = await this.findRow(name);
      expect(found, `row "${name}" should appear in the table`).toBeTruthy();
    }).toPass({ timeout: 15000 });

    return found!;
  }
}