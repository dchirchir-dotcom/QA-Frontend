import { test as baseTest } from '@playwright/test';
import { _common } from './common';
import { _loginPage } from '../pageFactory/auth/login';
import { UserManagementPage } from '../pageFactory/system/userManagement';
import { RolesAndPermissionsPage } from '../pageFactory/system/rolesPermissions';
import { LocationManagementPage } from '../pageFactory/system/locationManagement';

const test = baseTest.extend<{
  common: _common;
  loginPage: _loginPage;
  userManagementPage: UserManagementPage;
  rolesAndPermissionsPage: RolesAndPermissionsPage;
  locationManagementPage: LocationManagementPage;
}>({
  common: async ({ page, context, baseURL }, use) => {
    await use(new _common(page, context, baseURL));
  },
  loginPage: async ({ page }, use) => {
    await use(new _loginPage(page));
  },
  userManagementPage: async ({ page }, use) => {
    await use(new UserManagementPage(page));
  },
  rolesAndPermissionsPage: async ({ page }, use) => {
    await use(new RolesAndPermissionsPage(page));
  },
  locationManagementPage: async ({ page }, use) => {
    await use(new LocationManagementPage(page));
  },
});

export default test;
