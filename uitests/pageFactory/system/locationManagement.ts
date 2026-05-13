import { expect, Locator, Page } from '@playwright/test';
import { assertionText } from '../../helper/assertionText';
import { locationManagementLocators } from '../../helper/locators';

type CountryCandidate = {
  name: string;
  option: RegExp;
};

export class LocationManagementPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async createCountryFromCandidates(candidates: CountryCandidate[]) {
    for (const candidate of candidates) {
      await this.navigate('/system/countries');
      if (await this.rowContains(candidate.name)) continue;

      await this.clearSearch();
      await locationManagementLocators.addCountryButton(this.page).click();
      await this.selectOption(locationManagementLocators.countryNameSelect(this.page), candidate.option, 'Country');
      await this.saveForm();

      await this.expectRow(candidate.name);
      return candidate.name;
    }

    throw new Error('No unused country candidate was available for setup.');
  }

  async createCity(countryName: string, cityName: string, cityCode: string) {
    await this.navigate('/system/cities');
    if (await this.rowContains(cityName)) return;

    await this.clearSearch();
    await locationManagementLocators.addCityButton(this.page).click();
    await this.selectOption(locationManagementLocators.countryPublicIdSelect(this.page), new RegExp(countryName, 'i'), 'Country');
    await locationManagementLocators.nameInput(this.page).fill(cityName);
    await locationManagementLocators.codeInput(this.page).fill(cityCode);
    await this.saveForm();

    await this.expectRow(cityName);
    await this.expectRow(countryName);
  }

  async createDistrict(cityName: string, districtName: string) {
    await this.navigate('/system/districts');
    if (await this.rowContains(districtName)) return;

    await this.clearSearch();
    await locationManagementLocators.addDistrictButton(this.page).click();
    await this.selectOption(locationManagementLocators.cityPublicIdSelect(this.page), new RegExp(cityName, 'i'), 'City');
    await locationManagementLocators.regionNameInput(this.page).fill(districtName);
    await this.saveForm();

    await this.expectRow(districtName);
    await this.expectRow(cityName);
  }

  async createBranch(districtName: string, branchName: string) {
    await this.navigate('/system/branch');
    if (await this.rowContains(branchName)) return;

    await this.clearSearch();
    await locationManagementLocators.addBranchButton(this.page).click();
    await this.selectOption(locationManagementLocators.districtRegionIdSelect(this.page), new RegExp(districtName, 'i'), 'District');
    await locationManagementLocators.nameInput(this.page).fill(branchName);
    await this.saveForm();

    await this.expectRow(branchName);
    await this.expectRow(districtName);
  }

  async createDepartment(departmentName: string) {
    await this.navigate('/system/departments');
    if (await this.rowContains(departmentName)) return;

    await this.clearSearch();
    await locationManagementLocators.addDepartmentButton(this.page).click();
    await this.fillFirstAvailableInput(
      locationManagementLocators.departmentNameCandidates,
      departmentName,
      'Department name',
    );
    await this.fillIfVisible(
      locationManagementLocators.descriptionCandidates,
      `QA department ${departmentName}`,
    );
    await this.saveForm();

    await this.expectRow(departmentName);
  }

  async createRejectionCode(code: string, description: string, departmentName?: string | RegExp, moduleName?: RegExp) {
    await this.navigate('/system/reason-codes');
    if (await this.rowContains(code)) return;

    await this.clearSearch();
    await locationManagementLocators.addRejectionCodeButton(this.page).click();
    await locationManagementLocators.codeInput(this.page).fill(code);
    await locationManagementLocators.descriptionInput(this.page).fill(description);
    if (departmentName) {
      await this.selectOption(locationManagementLocators.departmentPublicIdSelect(this.page), departmentName, 'Department');
    } else {
      await this.selectFirstOption(locationManagementLocators.departmentPublicIdSelect(this.page), 'Department');
    }
    if (moduleName) {
      await this.selectOption(locationManagementLocators.moduleSelect(this.page), moduleName, 'Module');
    } else {
      await this.selectFirstOption(locationManagementLocators.moduleSelect(this.page), 'Module');
    }
    await this.saveForm();

    await this.expectRow(code);
  }

  async expectSearchFinds(path: string, searchTerm: string, expectedText = searchTerm) {
    await this.navigate(path);
    await this.search(searchTerm);
    await this.expectVisibleDataRow(expectedText);
  }

  async expectSearchNoResults(path: string, searchTerm: string) {
    await this.navigate(path);
    await this.search(searchTerm);
    await expect(locationManagementLocators.rowContaining(this.page, searchTerm)).not.toBeVisible({ timeout: 5000 });
  }

  async expectSortWorks(path: string, columnName?: RegExp) {
    await this.navigate(path);
    const rowsBefore = await this.getVisibleRowTexts();
    expect(rowsBefore.length, assertionText.locationManagement.rowsBeforeSorting(path)).toBeGreaterThan(0);

    const sorter = columnName
      ? locationManagementLocators.sorterForColumn(this.page, columnName)
      : locationManagementLocators.firstSorter(this.page);

    await expect(sorter, assertionText.locationManagement.sortableColumnVisible(path)).toBeVisible({ timeout: 10000 });
    await sorter.click({ force: true });
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.page.waitForTimeout(500);

    const rowsAfter = await this.getVisibleRowTexts();
    expect(rowsAfter.length, assertionText.locationManagement.rowsAfterSorting(path)).toBeGreaterThan(0);
  }

  async expectFilterOpens(path: string, columnName?: RegExp) {
    await this.navigate(path);
    const filterTrigger = columnName
      ? locationManagementLocators.filterForColumn(this.page, columnName)
      : locationManagementLocators.firstFilter(this.page);

    await expect(filterTrigger, assertionText.locationManagement.filterControlVisible(path)).toBeVisible({ timeout: 10000 });
    await filterTrigger.click({ force: true });
    await expect(
      locationManagementLocators.filterPopup(this.page),
      assertionText.locationManagement.filterPopupOpen(path),
    ).toBeVisible({ timeout: 5000 });
    await this.page.keyboard.press('Escape').catch(() => {});
  }

  private async navigate(path: string) {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await expect(this.page).toHaveURL(new RegExp(path.replace(/\//g, '\\/')));
    await expect(locationManagementLocators.table(this.page)).toBeVisible({ timeout: 15000 });
  }

  private async rowContains(text: string) {
    await this.search(text);
    return locationManagementLocators.rowContaining(this.page, text).isVisible({ timeout: 3000 }).catch(() => false);
  }

  private async expectRow(text: string) {
    await expect(async () => {
      await this.search(text);
      await expect(locationManagementLocators.rowContaining(this.page, text)).toBeVisible({ timeout: 5000 });
    }).toPass({ timeout: 20000 });
  }

  private async expectVisibleDataRow(text: string) {
    await expect(
      locationManagementLocators.visibleDataRowContaining(this.page, text),
    ).toBeVisible({ timeout: 10000 });
  }

  private async search(text: string) {
    const searchInput = locationManagementLocators.searchInput(this.page);

    if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await searchInput.fill(text);
      await searchInput.press('Enter').catch(() => {});
      await this.page.waitForLoadState('networkidle').catch(() => {});
      await this.page.waitForTimeout(500);
    }
  }

  private async clearSearch() {
    const searchInput = locationManagementLocators.searchInput(this.page);

    if (await searchInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await searchInput.fill('');
      await searchInput.press('Enter').catch(() => {});
      await this.page.waitForTimeout(500);
    }
  }

  private async fillFirstAvailableInput(selectors: string[], value: string, fieldName: string) {
    for (const selector of selectors) {
      const input = locationManagementLocators.bySelector(this.page, selector);
      if (await input.isVisible({ timeout: 1000 }).catch(() => false)) {
        await input.fill(value);
        return;
      }
    }

    const dialogInput = locationManagementLocators.fallbackDialogInput(this.page);
    await expect(dialogInput, assertionText.locationManagement.inputVisible(fieldName)).toBeVisible({ timeout: 10000 });
    await dialogInput.fill(value);
  }

  private async fillIfVisible(selectors: string[], value: string) {
    for (const selector of selectors) {
      const input = locationManagementLocators.bySelector(this.page, selector);
      if (await input.isVisible({ timeout: 1000 }).catch(() => false)) {
        await input.fill(value);
        return;
      }
    }
  }

  private async saveForm() {
    const dialog = locationManagementLocators.formDialog(this.page);
    await expect(dialog, assertionText.common.formDialogVisibleBeforeSaving).toBeVisible({ timeout: 10000 });
    await dialog.getByRole('button', { name: /save/i }).click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.page.waitForTimeout(1000);
    await expect(dialog).not.toBeVisible({ timeout: 10000 });
  }

  private async selectFirstOption(dropdown: Locator, fieldName: string) {
    await dropdown.click({ force: true });
    const option = locationManagementLocators.selectOptions(this.page).first();

    await expect(option, assertionText.locationManagement.optionAvailable(fieldName)).toBeVisible({ timeout: 10000 });
    await option.click({ force: true });
    await this.page.keyboard.press('Escape').catch(() => {});
  }

  private async selectOption(dropdown: Locator, optionText: string | RegExp, fieldName: string) {
    await dropdown.click({ force: true });

    const option = locationManagementLocators.selectOptions(this.page)
      .filter({ hasText: optionText })
      .first();

    if (!await option.isVisible({ timeout: 1000 }).catch(() => false)) {
      const searchText = typeof optionText === 'string'
        ? optionText
        : optionText.source.replace(/\\b|\\s|\^|\$|\.\*|\(\?:|\)|\|/g, ' ').trim();
      await dropdown.fill(searchText).catch(() => {});
    }

    await expect(option, assertionText.locationManagement.optionAvailable(fieldName, optionText)).toBeVisible({ timeout: 10000 });
    await option.click({ force: true });
    await this.page.keyboard.press('Escape').catch(() => {});
  }

  private async getVisibleRowTexts() {
    const rows = locationManagementLocators.rows(this.page);
    const count = await rows.count();
    const texts: string[] = [];

    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      if (!await row.isVisible().catch(() => false)) continue;
      const text = (await row.innerText().catch(() => '')).trim();
      if (!text || /no data/i.test(text)) continue;
      texts.push(text);
    }

    return texts;
  }
}
