import { expect, Locator, Page, Download } from '@playwright/test';

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

    this.heading = page.getByRole('heading', { name: /user management|users/i }).first();
    this.table   = page.locator('table').first();
    this.rows    = this.table.locator('tbody tr:not(.ant-table-measure-row)');
    this.dialog  = page.locator('[role="dialog"], .modal, .ant-modal, .MuiDialog-root').first();

    this.searchInput = page
      .locator('input[placeholder*="search" i], input[type="search"], input[aria-label*="search" i]')
      .first();

    this.createUserButton = page
      .getByRole('button', { name: /add user|create user|new user|invite user/i })
      .first();

    this.refreshButton = page.getByRole('button', { name: /refresh|reload/i }).first();
    this.exportButton  = page.getByRole('button', { name: /export|download/i }).first();

    this.roleFilter   = page.getByRole('combobox', { name: /role/i }).or(page.getByLabel(/role/i)).first();
    this.statusFilter = page.getByRole('combobox', { name: /status/i }).or(page.getByLabel(/status/i)).first();

    this.saveButton   = page.getByRole('button', { name: /save|submit|create|invite/i }).first();
    this.cancelButton = page.getByRole('button', { name: /cancel|close|discard/i }).first();

    this.validationMessages = page.locator(
      '[role="alert"], .error, .invalid-feedback, .ant-form-item-explain-error, .Mui-error'
    );
    this.requiredErrorMessages = page.locator(
      '.ant-form-item-explain-error, [role="alert"], .Mui-error'
    );

    this.firstNameInput = page
      .locator('#firstName')
      .or(page.getByPlaceholder(/enter first name/i))
      .or(page.getByLabel(/first name/i))
      .first();

    this.lastNameInput = page
      .locator('#lastName')
      .or(page.getByPlaceholder(/enter last name/i))
      .or(page.getByLabel(/last name/i))
      .first();

    this.emailInput = page
      .locator('#email')
      .or(page.getByPlaceholder(/please enter email|email/i))
      .or(page.getByLabel(/email/i))
      .first();

    this.phoneInput = page
      .getByPlaceholder(/705515476|712345678|phone/i)
      .or(page.locator('#phoneNumber'))
      .or(page.getByLabel(/phone number/i))
      .first();

    this.identificationNumberInput = page
      .locator('#identificationNumber')
      .or(page.getByPlaceholder(/enter identification number/i))
      .or(page.getByLabel(/^identification number$/i))
      .first();

    this.companyIdentificationNumberInput = page
      .locator('#companyIdentificationNumber')
      .or(page.getByPlaceholder(/enter company identification number/i))
      .or(page.getByLabel(/company identification number/i))
      .first();

    this.countryCodeSelect        = page.getByRole('combobox', { name: /country code/i }).first();
    this.identificationTypeSelect = page.getByRole('combobox', { name: /identification type/i }).first();
    this.roleSelect               = page.getByRole('combobox', { name: /roles/i }).first();
    this.branchSelect             = page.getByRole('combobox', { name: /branches/i }).first();
    this.departmentSelect         = page.getByRole('combobox', { name: /departments/i }).first();
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
    const body = this.page.locator('body');
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

    const popup = this.page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').last();
    const item  = popup
      .locator('.ant-select-item-option:not(.ant-select-item-option-disabled)')
      .filter({ hasText: option })
      .first();

    await expect(item, `${fieldName} option should be available`).toBeVisible({ timeout: 10000 });
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

    const popup = this.page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').last();
    const item  = popup
      .locator('.ant-select-item-option:not(.ant-select-item-option-disabled)')
      .first();

    await expect(item, `${fieldName} option should be available`).toBeVisible({ timeout: 10000 });
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
    const selectedValue = dropdown
      .locator(
        '.ant-select-selection-item, ' +
        '.ant-select-selection-overflow-item, ' +
        '.ant-select-selection-item-content'
      )
      .filter({ hasText: /\S/ })
      .first();

    if (await selectedValue.isVisible({ timeout: 1000 }).catch(() => false)) return;

    await expect(
      this.page.getByText(placeholder).first(),
      `${fieldName} placeholder should disappear after selection`,
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
        (await this.page.getByText(/user management|users/i).first().isVisible().catch(() => false));
      expect(ok).toBeTruthy();
    }).toPass({ timeout: 15000 });
  }

  async openCreateUser() {
    await this.createUserButton.click();
    await this.page.waitForURL(/create-user/).catch(() => {});
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await expect(this.firstNameInput).toBeVisible();
  }

  async search(term: string) {
    if (await this.searchInput.count() === 0) return;
    await this.searchInput.fill(term);
    await this.searchInput.press('Enter').catch(() => {});
  }

  async clearSearch() {
    if (await this.searchInput.count() === 0) return;
    await this.searchInput.fill('');
    await this.searchInput.press('Enter').catch(() => {});
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
    await expect(this.exportButton, 'export button should be visible').toBeVisible({ timeout: 10000 });

    const directDownload = this.page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
    await this.exportButton.click();

    const dropdown = this.page.locator(
      '.ant-dropdown:not(.ant-dropdown-hidden), .ant-menu, [role="menu"]'
    ).first();

    const dropdownVisible = await dropdown.isVisible({ timeout: 2000 }).catch(() => false);

    if (dropdownVisible) {
      const formatItem = dropdown
        .locator('[role="menuitem"], .ant-menu-item, li, button, a')
        .filter({ hasText: label })
        .first();

      await expect(
        formatItem,
        `export option "${label}" should be visible in the dropdown`,
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

  async goToNextPageIfAvailable(): Promise<boolean> {
    const nextButton = this.page
      .locator(
        '.ant-pagination-next:not(.ant-pagination-disabled) button, ' +
        'button[aria-label*="next" i]:not([disabled]), '              +
        'li[title="Next Page"]:not(.ant-pagination-disabled)'
      )
      .first();

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
    const sortTrigger = this.page
      .locator(
        'button[aria-label*="sort" i], '                     +
        '.ant-table-column-sorters, '                        +
        'th .ant-table-column-sorter, '                      +
        '[data-testid*="sort" i], '                          +
        'button:has-text("Sort"), '                          +
        '.ant-dropdown-trigger:has([aria-label*="sort" i])'
      )
      .first();

    const visible = await sortTrigger.isVisible({ timeout: 5000 }).catch(() => false);
    if (!visible) return false;

    await sortTrigger.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
    return true;
  }

  async openFilterMenu(): Promise<boolean> {
    const filterTrigger = this.page
      .locator(
        'button[aria-label*="filter" i], '                     +
        '.ant-table-filter-trigger, '                          +
        '[data-testid*="filter" i], '                          +
        'button:has-text("Filter"), '                          +
        '.ant-dropdown-trigger:has([aria-label*="filter" i])'
      )
      .first();

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

  async getFirstRowEmail(): Promise<string | null> {
    const text  = await this.rows.first().innerText().catch(() => '');
    const match = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    return match?.[0] || null;
  }

  async deactivateAndReactivateFirstActiveUser() {
    const activeRow = await this.getFirstRowByStatus('Active');
    expect(activeRow, 'an active user row should be available to deactivate').toBeTruthy();

    const rowKey = await this.getRowKey(activeRow!);
    await this.toggleUserStatusFromRow(activeRow!, /deactivate|confirm|yes|ok/i);
    await this.expectUserStatus(rowKey, 'Inactive');

    const inactiveRow = await this.getRowByKey(rowKey);
    expect(inactiveRow, 'the same user row should be available to reactivate').toBeTruthy();

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
    await expect(actionButton, 'row action menu button should be visible').toBeVisible({ timeout: 10000 });
    await actionButton.click();

    const switchControl = this.page.getByRole('switch').last()
      .or(this.page.locator('.ant-switch').last());
    await expect(switchControl, 'status switch should be visible in row action menu').toBeVisible({ timeout: 10000 });
    await switchControl.click();

    await this.confirmStatusChange(confirmButtonName);
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.page.waitForTimeout(2000);
  }

  private async confirmStatusChange(confirmButtonName: RegExp) {
    const confirmButton = this.page.getByRole('button', { name: confirmButtonName }).last();
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
