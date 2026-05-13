import { expect, Locator, Page, Download } from '@playwright/test';
import { assertionText } from '../../helper/assertionText';
import { commonLocators, userManagementLocators } from '../../helper/locators';

export class UserManagementPage {
  readonly page: Page;

  readonly heading: Locator;
  readonly table:   Locator;
  readonly rows:    Locator;
  readonly dialog:  Locator;

  readonly searchInput:      Locator;
  readonly createUserButton: Locator;
  readonly refreshButton:    Locator;
  readonly exportButton:     Locator;
  readonly roleFilter:       Locator;
  readonly statusFilter:     Locator;

  readonly saveButton:   Locator;
  readonly cancelButton: Locator;

  readonly validationMessages:    Locator;
  readonly requiredErrorMessages: Locator;

  readonly firstNameInput: Locator;
  readonly lastNameInput:  Locator;
  readonly emailInput:     Locator;
  readonly phoneInput:     Locator;

  readonly identificationNumberInput:        Locator;
  readonly companyIdentificationNumberInput: Locator;
  readonly countryCodeSelect:                Locator;
  readonly identificationTypeSelect:         Locator;

  readonly roleSelect:       Locator;
  readonly branchSelect:     Locator;
  readonly departmentSelect: Locator;

  constructor(page: Page) {
    this.page = page;

    this.heading = userManagementLocators.heading(page);
    this.table = userManagementLocators.table(page);
    this.rows = userManagementLocators.rows(this.table);
    this.dialog = userManagementLocators.dialog(page);
    this.searchInput = userManagementLocators.searchInput(page);
    this.createUserButton = userManagementLocators.createUserButton(page);
    this.refreshButton = userManagementLocators.refreshButton(page);
    this.exportButton = userManagementLocators.exportButton(page);
    this.roleFilter = userManagementLocators.roleFilter(page);
    this.statusFilter = userManagementLocators.statusFilter(page);
    this.saveButton = userManagementLocators.saveButton(page);
    this.cancelButton = userManagementLocators.cancelButton(page);
    this.validationMessages = userManagementLocators.validationMessages(page);
    this.requiredErrorMessages = userManagementLocators.requiredErrorMessages(page);
    this.firstNameInput = userManagementLocators.firstNameInput(page);
    this.lastNameInput = userManagementLocators.lastNameInput(page);
    this.emailInput = userManagementLocators.emailInput(page);
    this.phoneInput = userManagementLocators.phoneInput(page);
    this.identificationNumberInput = userManagementLocators.identificationNumberInput(page);
    this.companyIdentificationNumberInput = userManagementLocators.companyIdentificationNumberInput(page);
    this.countryCodeSelect = userManagementLocators.countryCodeSelect(page);
    this.identificationTypeSelect = userManagementLocators.identificationTypeSelect(page);
    this.roleSelect = userManagementLocators.roleSelect(page);
    this.branchSelect = userManagementLocators.branchSelect(page);
    this.departmentSelect = userManagementLocators.departmentSelect(page);
  }

  private async slow() {
    await this.page.waitForTimeout(1000);
  }

  private async gotoWithRetry(path: string) {
    for (let i = 0; i < 3; i++) {
      try {
        await this.page.goto(path, { waitUntil: 'domcontentloaded' });
        return;
      } catch {
        await this.page.waitForTimeout(1000);
      }
    }
  }

  private async reloadIfServiceUnavailable() {
    const body = userManagementLocators.body(this.page);
    for (let i = 0; i < 2; i++) {
      const text = await body.innerText().catch(() => '');
      if (!/503|service unavailable/i.test(text)) return;

      await this.page.reload({ waitUntil: 'domcontentloaded' });
      await this.page.waitForLoadState('networkidle').catch(() => {});
    }
  }

  private async selectOption(
    dropdown: Locator,
    option: string | RegExp,
    fieldName = 'dropdown',
    placeholder: RegExp = /select/i,
    verifySelection = true,
  ) {
    await dropdown.scrollIntoViewIfNeeded();
    await dropdown.click({ force: true });

    const popup = userManagementLocators.selectPopup(this.page);
    const item = userManagementLocators.selectOption(popup)
      .filter({ hasText: option })
      .first();

    await expect(item, assertionText.userManagement.dropdownOptionAvailable(fieldName)).toBeVisible({ timeout: 10000 });
    await item.click({ force: true }).catch(async () => {
      await item.evaluate((el) => (el as HTMLElement).click());
    });
    await this.page.keyboard.press('Escape').catch(() => {});

    if (verifySelection) {
      await this.expectDropdownHasSelection(dropdown, fieldName, placeholder);
    }
  }

  private async selectOptional(
    dropdown: Locator,
    fieldName: string,
    placeholder: RegExp,
    option?: string | RegExp,
  ) {
    if (!option) {
      await this.selectFirstOption(dropdown, fieldName, placeholder);
      return;
    }
    await this.selectOption(dropdown, option, fieldName, placeholder);
  }

  private async selectFirstOption(
    dropdown: Locator,
    fieldName = 'dropdown',
    placeholder: RegExp = /select/i,
  ) {
    await dropdown.scrollIntoViewIfNeeded();
    await dropdown.click({ force: true });

    const popup = userManagementLocators.selectPopup(this.page);
    const item = userManagementLocators.selectOption(popup)
      .first();

    await expect(item, assertionText.userManagement.dropdownOptionAvailable(fieldName)).toBeVisible({ timeout: 10000 });
    await item.click({ force: true }).catch(async () => {
      await item.evaluate((el) => (el as HTMLElement).click());
    });
    await this.page.keyboard.press('Escape').catch(() => {});
    await this.expectDropdownHasSelection(dropdown, fieldName, placeholder);
  }

  private async expectDropdownHasSelection(
    dropdown: Locator,
    fieldName: string,
    placeholder: RegExp,
  ) {
    const selectedValue = userManagementLocators.selectedValue(dropdown);

    if (await selectedValue.isVisible({ timeout: 1000 }).catch(() => false)) return;

    await expect(
      userManagementLocators.text(this.page, placeholder),
      assertionText.userManagement.placeholderGone(fieldName),
    ).not.toBeVisible({ timeout: 5000 });
  }

  async navigate() {
    await this.gotoWithRetry('/system/user-management');
    await this.reloadIfServiceUnavailable();

    await expect(this.page).toHaveURL(/\/system\/user-management/);
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async expectLoaded() {
    await expect(async () => {
      const ok =
        (await this.heading.isVisible().catch(() => false)) ||
        (await this.table.isVisible().catch(() => false))   ||
        (await userManagementLocators.pageTitleText(this.page).isVisible().catch(() => false));
      expect(ok).toBeTruthy();
    }).toPass({ timeout: 15000 });
  }

  async openCreateUser() {
    await this.createUserButton.click();
    await this.page.waitForURL(/create-user/).catch(() => {});
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await expect(this.firstNameInput).toBeVisible();
    return true;
  }

  async search(term: string) {
    if (await this.searchInput.count() === 0) return;
    await this.searchInput.fill(term);
    await this.searchInput.press('Enter').catch(() => {});
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async clearSearch() {
    if (await this.searchInput.count() === 0) return;
    await this.searchInput.fill('');
    await this.searchInput.press('Enter').catch(() => {});
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async expectSearchFinds(term: string, expectedText = term) {
    await this.search(term);
    await expect(
      this.rows.filter({ hasText: expectedText }).first(),
      assertionText.userManagement.searchIncludes(expectedText),
    ).toBeVisible({ timeout: 10000 });
  }

  async expectSearchNoResults(term: string) {
    await this.search(term);
    await expect(
      this.rows.filter({ hasText: term }).first(),
      assertionText.userManagement.searchExcludes(term),
    ).not.toBeVisible({ timeout: 5000 });
  }

  async expectSortKeepsTableUsable() {
    const rowsBefore = await this.getVisibleRowTexts();
    expect(rowsBefore.length, assertionText.userManagement.rowsBeforeSorting).toBeGreaterThan(0);

    const opened = await this.openSortMenu();
    expect(opened, assertionText.userManagement.sortControlAvailable).toBeTruthy();

    const rowsAfter = await this.getVisibleRowTexts();
    expect(rowsAfter.length, assertionText.userManagement.rowsAfterSorting).toBeGreaterThan(0);
  }

  async saveUserForm() {
    await this.saveButton.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async closeDialogOrForm() {
    if (await this.cancelButton.count() > 0) {
      await this.cancelButton.click();
      return;
    }
    await this.page.keyboard.press('Escape');
  }

  async exportByLabel(label: RegExp): Promise<Download> {
    const directIcon = this.exportIcon(label);
    if (await directIcon.isVisible({ timeout: 3000 }).catch(() => false)) {
      const [download] = await Promise.all([
        this.page.waitForEvent('download', { timeout: 30000 }),
        directIcon.click(),
      ]);
      return download;
    }

    await expect(this.exportButton, assertionText.userManagement.exportButtonVisible).toBeVisible({ timeout: 10000 });

    const directDownload = this.page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
    await this.exportButton.click();

    const dropdown = userManagementLocators.exportDropdown(this.page);

    const dropdownVisible = await dropdown.isVisible({ timeout: 2000 }).catch(() => false);

    if (dropdownVisible) {
      const formatItem = userManagementLocators.exportDropdownItems(dropdown)
        .filter({ hasText: label })
        .first();

      await expect(
        formatItem,
        assertionText.userManagement.exportOptionVisible(label),
      ).toBeVisible({ timeout: 5000 });

      const [download] = await Promise.all([
        this.page.waitForEvent('download', { timeout: 30000 }),
        formatItem.click(),
      ]);
      return download;
    }

    const resolved = await directDownload;
    if (resolved) return resolved;

    const [download] = await Promise.all([
      this.page.waitForEvent('download', { timeout: 30000 }),
      this.exportButton.click(),
    ]);
    return download;
  }

  async expectExportStarted(label: RegExp, fileName: RegExp) {
    const directIcon = this.exportIcon(label);
    if (await directIcon.isVisible({ timeout: 3000 }).catch(() => false)) {
      await this.clickExportAndExpectStarted(directIcon, fileName);
      return;
    }

    if (await this.exportButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await this.exportButton.click();

      const dropdown = userManagementLocators.exportDropdown(this.page);

      if (await dropdown.isVisible({ timeout: 2000 }).catch(() => false)) {
        const formatItem = userManagementLocators.exportDropdownItems(dropdown)
          .filter({ hasText: label })
          .first();

        await expect(formatItem, assertionText.userManagement.exportOptionVisible(label)).toBeVisible({ timeout: 5000 });
        await this.clickExportAndExpectStarted(formatItem, fileName);
        return;
      }

      await this.clickExportAndExpectStarted(this.exportButton, fileName);
      return;
    }

    await expect(directIcon, assertionText.userManagement.exportControlVisible(label)).toBeVisible({ timeout: 10000 });
  }

  private exportIcon(label: RegExp) {
    return userManagementLocators.exportIcon(this.page, label);
  }

  private async clickExportAndExpectStarted(control: Locator, fileName: RegExp) {
    const downloadPromise = this.page.waitForEvent('download', { timeout: 30000 }).catch(() => null);
    await control.click();

    const download = await downloadPromise;
    if (download) {
      expect(download.suggestedFilename(), assertionText.common.downloadedFileMatchesExportType).toMatch(fileName);
      return;
    }

    await expect(
      commonLocators.exportStartedMessage(this.page),
      assertionText.common.exportQueued,
    ).toBeVisible({ timeout: 10000 });
  }

  async goToNextPageIfAvailable(): Promise<boolean> {
    const nextButton = userManagementLocators.nextPageButton(this.page);

    const visible = await nextButton.isVisible({ timeout: 5000 }).catch(() => false);
    if (!visible) return false;

    const disabled =
      (await nextButton.getAttribute('disabled')) !== null ||
      (await nextButton.getAttribute('aria-disabled')) === 'true';

    if (disabled) return false;

    await nextButton.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await expect(this.table).toBeVisible({ timeout: 10000 });
    return true;
  }

  async openSortMenu(): Promise<boolean> {
    const sortTrigger = userManagementLocators.sortTrigger(this.page);

    const visible = await sortTrigger.isVisible({ timeout: 5000 }).catch(() => false);
    if (!visible) return false;

    await sortTrigger.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
    return true;
  }

  async openFilterMenu(): Promise<boolean> {
    const filterTrigger = userManagementLocators.filterTrigger(this.page);

    const visible = await filterTrigger.isVisible({ timeout: 5000 }).catch(() => false);
    if (!visible) return false;

    await filterTrigger.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
    return true;
  }

  async fillCreateUserForm(data: {
    firstName:                    string;
    lastName:                     string;
    email:                        string;
    phoneNumber?:                 string;
    identificationNumber?:        string;
    companyIdentificationNumber?: string;
    identificationTypeName?:      string | RegExp;
    roleName?:                    string | RegExp;
    branchName?:                  string | RegExp;
    departmentName?:              string | RegExp;
  }) {
    await this.fillIdentification(data);
    await this.fillAssignments(data);
    await this.fillBasicInfo(data);
  }

  private async fillBasicInfo(data: any) {
    await this.firstNameInput.fill(data.firstName);               await this.slow();
    await this.lastNameInput.fill(data.lastName);                 await this.slow();
    await this.emailInput.fill(data.email);                       await this.slow();
    await this.phoneInput.fill(data.phoneNumber || '705515476');  await this.slow();
  }

  private async fillIdentification(data: any) {
    await this.selectOption(
      this.countryCodeSelect, /tanzania/i, 'Country Code', /select country code/i, false
    );
    await this.slow();

    await this.identificationNumberInput.fill(
      data.identificationNumber || `ID${Date.now()}`
    );
    await this.slow();

    await this.companyIdentificationNumberInput.fill(
      data.companyIdentificationNumber || `CO${Date.now()}`
    );
    await this.slow();

    await this.selectOptional(
      this.identificationTypeSelect,
      'Identification Type',
      /select identification type/i,
      data.identificationTypeName,
    );
    await this.slow();
  }

  private async fillAssignments(data: any) {
    await this.selectOptional(this.branchSelect,     'Branches',    /select branches/i,    data.branchName);     await this.slow();
    await this.selectOptional(this.departmentSelect, 'Departments', /select departments/i, data.departmentName); await this.slow();
    await this.selectOptional(this.roleSelect,       'Roles',       /select roles/i,       data.roleName);       await this.slow();
  }

  async getRowCount(): Promise<number> {
    return this.rows.count();
  }

  async getVisibleRowTexts(): Promise<string[]> {
    const count = await this.rows.count();
    const texts: string[] = [];

    for (let i = 0; i < count; i++) {
      const row = this.rows.nth(i);
      if (!await row.isVisible().catch(() => false)) continue;
      const text = (await row.innerText().catch(() => '')).trim();
      if (!text || /no data/i.test(text)) continue;
      texts.push(text);
    }

    return texts;
  }

  async getFirstRowEmail(): Promise<string | null> {
    const text  = await this.rows.first().innerText().catch(() => '');
    const match = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    return match?.[0] || null;
  }

  async deactivateAndReactivateFirstActiveUser() {
    const activeRow = await this.getFirstRowByStatus('Active');
    expect(activeRow, assertionText.userManagement.activeUserAvailable).toBeTruthy();

    const rowKey = await this.getRowKey(activeRow!);
    await this.toggleUserStatusFromRow(activeRow!, /deactivate|confirm|yes|ok/i);
    await this.expectUserStatus(rowKey, 'Inactive');

    const inactiveRow = await this.getRowByKey(rowKey);
    expect(inactiveRow, assertionText.userManagement.inactiveUserAvailable).toBeTruthy();

    await this.toggleUserStatusFromRow(inactiveRow!, /activate|confirm|yes|ok/i);
    await this.expectUserStatus(rowKey, 'Active');
  }

  private async getFirstRowByStatus(status: 'Active' | 'Inactive'): Promise<Locator | null> {
    const count = await this.rows.count();
    for (let i = 0; i < count; i++) {
      const row  = this.rows.nth(i);
      if (!await row.isVisible().catch(() => false)) continue;
      const text = await row.innerText().catch(() => '');
      if (/no data/i.test(text)) continue;
      if (this.rowHasStatus(text, status)) return row;
    }
    return null;
  }

  private async getRowByKey(rowKey: string): Promise<Locator | null> {
    const count = await this.rows.count();
    for (let i = 0; i < count; i++) {
      const row  = this.rows.nth(i);
      const text = await row.innerText().catch(() => '');
      if (text.includes(rowKey)) return row;
    }
    return null;
  }

  private async getRowKey(row: Locator): Promise<string> {
    const text  = await row.innerText();
    const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
    if (email) return email;

    const phone = text.match(/\+255\d{9}/)?.[0];
    if (phone) return phone;

    return text.split(/\s+/).slice(0, 4).join(' ');
  }

  private rowHasStatus(rowText: string, status: 'Active' | 'Inactive'): boolean {
    if (status === 'Inactive') return /(^|\s|•)Inactive(\s|$)/i.test(rowText);
    return /(^|\s|•)Active(\s|$)/i.test(rowText) && !/(^|\s|•)Inactive(\s|$)/i.test(rowText);
  }

  private async toggleUserStatusFromRow(row: Locator, confirmButtonName: RegExp) {
    await row.scrollIntoViewIfNeeded();

    const actionButton = row.getByRole('button').last();
    await expect(actionButton, assertionText.userManagement.rowActionMenuButtonVisible).toBeVisible({ timeout: 10000 });
    await actionButton.click();

    const switchControl = userManagementLocators.statusSwitch(this.page);
    await expect(switchControl, assertionText.userManagement.statusSwitchVisible).toBeVisible({ timeout: 10000 });
    await switchControl.click();

    await this.confirmStatusChange(confirmButtonName);
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.page.waitForTimeout(2000);
  }

  private async confirmStatusChange(confirmButtonName: RegExp) {
    const confirmButton = userManagementLocators.confirmButton(this.page, confirmButtonName);
    if (await confirmButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await confirmButton.click();
      return;
    }
    await this.page.keyboard.press('Enter').catch(() => {});
  }

  private async expectUserStatus(rowKey: string, status: 'Active' | 'Inactive') {
    await expect(async () => {
      await this.navigate();
      const row = await this.getRowByKey(rowKey);
      expect(row, `row ${rowKey} should still be visible after status change`).toBeTruthy();
      const text = await row!.innerText();
      expect(this.rowHasStatus(text, status), `row ${rowKey} should show ${status}`).toBeTruthy();
    }).toPass({ timeout: 20000 });
  }

  async expectValidationErrors() {
    await expect(this.requiredErrorMessages.first()).toBeVisible();
  }
}
