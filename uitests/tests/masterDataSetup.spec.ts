import { expect } from '@playwright/test';
import test from '../helper/baseTest';
import { assertionPatterns, assertionText } from '../helper/assertionText';
import { locationManagementLocators } from '../helper/locators';

const runId = Date.now().toString().slice(-6);
const cityName = `QA City ${runId}`;
const cityCode = `QC${runId.slice(-4)}`;
const districtName = `QA District ${runId}`;
const branchName = `QA Branch ${runId}`;
const departmentName = `QA Department ${runId}`;
const rejectionCode = `QA-RJ-${runId}`;
const permissionGroupName = `QA Master Data ${runId}`;

const countryCandidates = [
  { name: 'Andorra', option: /andorra/i },
  { name: 'Angola', option: /angola/i },
  { name: 'Anguilla', option: /anguilla/i },
  { name: 'Antarctica', option: /antarctica/i },
  { name: 'Antigua And Barbuda', option: /antigua and barbuda/i },
];

test.describe.serial('Master data setup flow', { tag: '@master-data' }, () => {
  test.setTimeout(120000);

  let countryName = '';

  test.skip('Create a country', async ({ locationManagementPage }) => {
    countryName = await locationManagementPage.createCountryFromCandidates(countryCandidates);
  });

  test('Create a city mapped to the country', async ({ locationManagementPage }) => {
    await locationManagementPage.createCity(countryName, cityName, cityCode);
  });

  test('Create a district mapped to the city', async ({ locationManagementPage }) => {
    await locationManagementPage.createDistrict(cityName, districtName);
  });

  test('Create a branch mapped to the district', async ({ locationManagementPage, page }) => {
    await locationManagementPage.createBranch(districtName, branchName);

    await page.goto('/system/branch', { waitUntil: 'domcontentloaded' });
    await expect(locationManagementLocators.rowContaining(page, branchName)).toContainText(districtName);
  });

  test('Create a department', async ({ locationManagementPage }) => {
    await locationManagementPage.createDepartment(departmentName);
  });

  test('Create a rejection code', async ({ locationManagementPage }) => {
    test.setTimeout(240000);
    await locationManagementPage.createRejectionCode(
      rejectionCode,
      `QA rejection reason ${runId}`,
      departmentName,
    );
  });

  test.skip('Search finds created setup records', async ({ locationManagementPage }) => {
    await locationManagementPage.expectSearchFinds('/system/countries', countryName);
    await locationManagementPage.expectSearchFinds('/system/cities', cityName);
    await locationManagementPage.expectSearchFinds('/system/districts', districtName);
    await locationManagementPage.expectSearchFinds('/system/branch', branchName);
    await locationManagementPage.expectSearchFinds('/system/departments', departmentName);
    await locationManagementPage.expectSearchFinds('/system/reason-codes', rejectionCode);
  });

  test.skip('Search handles no-result values without leaking stale rows', async ({ locationManagementPage }) => {
    const missingTerm = `missing-${runId}-not-present`;

    await locationManagementPage.expectSearchNoResults('/system/countries', missingTerm);
    await locationManagementPage.expectSearchNoResults('/system/cities', missingTerm);
    await locationManagementPage.expectSearchNoResults('/system/departments', missingTerm);
    await locationManagementPage.expectSearchNoResults('/system/reason-codes', missingTerm);
  });

  test.skip('Sort setup tables where supported', async ({ locationManagementPage }) => {
    await locationManagementPage.expectSortWorks('/system/countries', /country|name/i);
    await locationManagementPage.expectSortWorks('/system/cities', /city|name/i);
    await locationManagementPage.expectSortWorks('/system/districts', /district|region|name/i);
    await locationManagementPage.expectSortWorks('/system/branch', /branch|name/i);
    await locationManagementPage.expectSortWorks('/system/departments', /department|name/i);
    await locationManagementPage.expectSortWorks('/system/reason-codes', /code|reason/i);
  });

  test.skip('Filter setup tables where supported', async ({ locationManagementPage }) => {
    await locationManagementPage.expectFilterOpens('/system/cities', /country/i);
    await locationManagementPage.expectFilterOpens('/system/districts', /city/i);
    await locationManagementPage.expectFilterOpens('/system/branch', /district|region/i);
    await locationManagementPage.expectFilterOpens('/system/reason-codes', /department|module/i);
  });

  test('Create a permission group with permissions', async ({
    rolesAndPermissionsPage,
  }) => {
    test.setTimeout(240000);
    await rolesAndPermissionsPage.navigate();
    await rolesAndPermissionsPage.goToPermissionGroupsTab();
    await rolesAndPermissionsPage.addPermissionGroup(permissionGroupName);
    await rolesAndPermissionsPage.addPermissionsToGroup(
      new RegExp(permissionGroupName, 'i'),
      ['Create', 'Edit', 'View'],
    );

    const permissionGroupRow = await rolesAndPermissionsPage.findPermissionGroupRow(
      new RegExp(permissionGroupName, 'i'),
    );
    expect(permissionGroupRow, assertionText.masterData.permissionGroupExistsAfterSetup).toBeTruthy();
    await expect(permissionGroupRow!).toContainText(assertionPatterns.rolesPermissions.permissionSummary);
  });
});
