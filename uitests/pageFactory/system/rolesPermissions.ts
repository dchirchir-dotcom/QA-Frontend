import { expect, Locator, Page } from '@playwright/test';
import { assertionText } from '../../helper/assertionText';
import { rolesPermissionsLocators } from '../../helper/locators';

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

    this.rolesTab = rolesPermissionsLocators.rolesTab(page);
    this.permissionGroupsTab = rolesPermissionsLocators.permissionGroupsTab(page);
    this.addRoleButton = rolesPermissionsLocators.addRoleButton(page);
    this.filtersButton = rolesPermissionsLocators.filtersButton(page);
    this.refreshButton = rolesPermissionsLocators.refreshButton(page);
    this.addPermissionGroupButton = rolesPermissionsLocators.addPermissionGroupButton(page);
    this.saveButton = rolesPermissionsLocators.saveButton(page);
    this.cancelButton = rolesPermissionsLocators.cancelButton(page);
    this.resetButton = rolesPermissionsLocators.resetButton(page);
    this.roleNameInput = rolesPermissionsLocators.roleNameInput(page);
    this.permissionGroupNameInput = rolesPermissionsLocators.permissionGroupNameInput(page);
    this.permissionInput = rolesPermissionsLocators.permissionInput(page);
    this.addPermissionButton = rolesPermissionsLocators.addPermissionButton(page);
    this.nextButton = rolesPermissionsLocators.nextButton(page);
    this.previousButton = rolesPermissionsLocators.previousButton(page);
    this.confirmAndSaveButton = rolesPermissionsLocators.confirmAndSaveButton(page);
    this.moduleSelect = rolesPermissionsLocators.moduleSelect(page);
    this.rolesTable = rolesPermissionsLocators.rolesTable(page);
    this.rolesRows = rolesPermissionsLocators.tableRows(this.rolesTable);
    this.permissionGroupsTable = rolesPermissionsLocators.permissionGroupsTable(page);
    this.permissionGroupsRows = rolesPermissionsLocators.tableRows(this.permissionGroupsTable);
  }

  async navigate() {
    await this.gotoWithRetry('/system/user-management');
    await this.waitForNetwork();
    await expect(this.page).toHaveURL(/\/system\/user-management/);
  }

  async goToRolesTab() {
    await rolesPermissionsLocators.rolesTabText(this.page).click().catch(() => {});

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
    expect(row, assertionText.rolesPermissions.roleExists(roleName)).toBeTruthy();

    await this.openRowActionMenu(row!);

    const statusSwitch = rolesPermissionsLocators.statusSwitch(this.page);

    await expect(statusSwitch, assertionText.rolesPermissions.statusSwitchAppears).toBeVisible({ timeout: 10000 });
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
    expect(row, assertionText.rolesPermissions.roleExists(roleName)).toBeTruthy();

    await this.openAddPermissionsPanel(row!);

    await expect(this.moduleSelect, assertionText.rolesPermissions.moduleSelectVisible).toBeVisible({ timeout: 10000 });
    await this.moduleSelect.click();
    await this.selectDropdownOption(moduleName);
    await this.clickNextWhenEnabled('module selection');

    await this.checkPermissions(permissions);
    await this.clickNextWhenEnabled('permission selection');

    await expect(this.confirmAndSaveButton, assertionText.rolesPermissions.confirmButtonAppears).toBeVisible({ timeout: 10000 });
    await this.confirmAndSaveButton.click();
    await this.waitForNetwork();
  }

  async viewRolePermissions(roleName: string | RegExp) {
    const row = await this.findRoleRowWithActions(roleName);
    expect(row, assertionText.rolesPermissions.roleExists(roleName)).toBeTruthy();

    await this.openRowActionMenu(row!);

    const viewOption = rolesPermissionsLocators.viewOption(this.page);

    await expect(viewOption, assertionText.rolesPermissions.viewOptionAppears).toBeVisible({ timeout: 10000 });
    await viewOption.click();
    await this.waitForNetwork();
  }

  async addPermissionGroup(name: string) {
    await this.addPermissionGroupButton.click();
    await this.pause();

    await expect(this.permissionGroupNameInput, assertionText.rolesPermissions.nameInputAppears).toBeVisible({ timeout: 10000 });
    await this.permissionGroupNameInput.fill(name);
    await this.pause();

    await this.saveButton.click();
    await this.waitForNetwork();
    await this.waitForRowToAppear(new RegExp(name, 'i'));
  }

  async addPermissionsToGroup(groupName: string | RegExp, permissionSets: string[]) {
    const row = await this.waitForRowToAppear(groupName);

    const addPermissionsAction = rolesPermissionsLocators.addPermissionsAction(row);

    await addPermissionsAction.scrollIntoViewIfNeeded();
    await expect(addPermissionsAction, assertionText.rolesPermissions.addPermissionsActionVisible).toBeVisible({ timeout: 10000 });
    await addPermissionsAction.click({ force: true });
    await this.pause();

    await expect(this.permissionInput, assertionText.rolesPermissions.permissionInputAppears).toBeVisible({ timeout: 10000 });

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
      assertionText.rolesPermissions.permissionGroupDisplaysSavedPermissions(groupName),
    ).toContainText(permissionPattern, { timeout: 10000 });
  }

  async editPermissionGroupName(currentName: string | RegExp, newName: string) {
    const row = await this.findPermissionGroupRow(currentName);
    expect(row, assertionText.rolesPermissions.permissionGroupExists(currentName)).toBeTruthy();

    await this.openRowActionMenu(row!);

    const editOption = rolesPermissionsLocators.editOption(this.page);

    await editOption.click();
    await this.pause();

    const nameInput = rolesPermissionsLocators.permissionGroupEditNameInput(this.page);

    await expect(nameInput, assertionText.rolesPermissions.nameInputForEditing).toBeVisible({ timeout: 10000 });
    await nameInput.fill(newName);
    await this.pause();

    await this.saveButton.click();
    await this.waitForNetwork();
  }

  async deletePermissionGroup(name: string | RegExp) {
    const row = await this.findPermissionGroupRow(name);
    expect(row, assertionText.rolesPermissions.permissionGroupExistsBeforeDeletion(name)).toBeTruthy();

    await this.openRowActionMenu(row!);
    await rolesPermissionsLocators.deleteOption(this.page).click();
    await this.pause();

    const confirmDeleteButton = rolesPermissionsLocators.confirmDeleteButton(this.page);
    await expect(confirmDeleteButton, assertionText.rolesPermissions.deleteConfirmButtonAppears).toBeVisible({ timeout: 5000 });
    await confirmDeleteButton.click();
    await this.waitForNetwork();
  }

  async togglePermissionGroupStatus(name: string | RegExp) {
    const row = await this.findPermissionGroupRow(name);
    expect(row, assertionText.rolesPermissions.permissionGroupExists(name)).toBeTruthy();

    await this.openRowActionMenu(row!);

    const statusSwitch = rolesPermissionsLocators.statusSwitch(this.page);

    await expect(statusSwitch, assertionText.rolesPermissions.statusSwitchAppears).toBeVisible({ timeout: 10000 });
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
      expect(row, assertionText.rolesPermissions.roleAppears(name)).toBeTruthy();
    }).toPass({ timeout: 15000 });
  }

  async expectPermissionGroupInTable(name: string | RegExp) {
    await expect(async () => {
      const row = await this.findPermissionGroupRow(name);
      expect(row, assertionText.rolesPermissions.permissionGroupAppears(name)).toBeTruthy();
    }).toPass({ timeout: 15000 });
  }

  async expectPermissionGroupNotInTable(name: string | RegExp) {
    await expect(async () => {
      const row = await this.findPermissionGroupRow(name);
      expect(row, assertionText.rolesPermissions.permissionGroupDeleted(name)).toBeNull();
    }).toPass({ timeout: 15000 });
  }

  async expectSuccessToast() {
    await expect(
      rolesPermissionsLocators.successToast(this.page),
    ).toBeVisible({ timeout: 10000 });
  }

  async expectErrorToast() {
    await expect(
      rolesPermissionsLocators.errorToast(this.page),
    ).toBeVisible({ timeout: 10000 });
  }

  async expectValidationErrors() {
    await expect(
      rolesPermissionsLocators.validationError(this.page),
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
    const actionButton = rolesPermissionsLocators.rowActionButton(row);

    await actionButton.scrollIntoViewIfNeeded();
    await expect(actionButton, assertionText.rolesPermissions.rowActionButtonVisible).toBeVisible({ timeout: 10000 });
    await actionButton.click();
    await this.pause();
  }

  private async selectDropdownOption(option: string | RegExp, fallbackToFirst = false) {
    const allOptions = rolesPermissionsLocators.dropdownOptions(this.page);
    let target = allOptions.filter({ hasText: option }).first();

    const isVisible = () => target.isVisible({ timeout: 5000 }).catch(() => false);
    if (fallbackToFirst && !(await isVisible())) {
      target = allOptions.filter({ hasText: /\S/ }).first();
    }

    await expect(target, assertionText.rolesPermissions.optionVisible(option)).toBeVisible({ timeout: 10000 });
    await target.click({ force: true });
    await this.pause();
  }

  private async clickNextWhenEnabled(stepName: string) {
    await expect(this.nextButton, assertionText.rolesPermissions.nextButtonEnabled(stepName)).toBeEnabled({ timeout: 15000 });
    await this.nextButton.click();
    await this.waitForNetwork();
    await this.pause();
  }

  private async confirmDialogIfVisible() {
    const confirmButton = rolesPermissionsLocators.confirmButton(this.page);
    if (await confirmButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await confirmButton.click();
    }
  }

  private async openAddPermissionsPanel(row: Locator) {
    const inlineButton = rolesPermissionsLocators.inlineAddPermissionsButton(row);

    if (await inlineButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await inlineButton.click();
    } else {
      await this.openRowActionMenu(row);
      await rolesPermissionsLocators.addPermissionsText(this.page).click();
    }

    await this.waitForNetwork();
    await this.pause();
  }

  private async checkPermissions(permissions: Permission[]) {
    for (const permission of permissions) {
      const checkbox = rolesPermissionsLocators.permissionCheckbox(this.page, permission);
      if (await checkbox.isVisible({ timeout: 3000 }).catch(() => false)) {
        if (!await checkbox.isChecked()) {
          await checkbox.check();
        }
      }
    }

    await this.pause();

    if (await this.nextButton.isEnabled().catch(() => false)) return;

    const allCheckboxes = rolesPermissionsLocators.allCheckboxes(this.page);
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
    const rows = rolesPermissionsLocators.rows(this.page);
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
    const rows = rolesPermissionsLocators.rows(this.page);
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
      expect(found, assertionText.rolesPermissions.rowAppears(name)).toBeTruthy();
    }).toPass({ timeout: 15000 });

    return found!;
  }
}
