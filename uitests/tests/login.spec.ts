import { expect } from '@playwright/test';
import test from '../helper/baseTest';
import _config from '../config/configManager';
import { _loginPage } from '../pageFactory/auth/login';

test.beforeEach(async ({ common }) => {
  await common.loadSite();
});

test.describe('Authentication - Login Flow', () => {
  test('should login with valid credentials', {tag: '@Login'}, async ({ page, common, loginPage }) => {
    try {
      await loginPage.loginWithCredentials(
        'd.chirchir@itibari.io',
        'ebb0',
      );
      await page.waitForURL(/orders|dashboard|home/, { timeout: 15000 });
    } catch (error) {
      console.error('[TEST] ✗ Login test failed:', error);
      throw error;
    }
  });

  test('should login with 2FA/OTP authentication', { tag: '@Login' }, async ({ browser }) => {
    const otpSecretOrCode = process.env.ITIBARI_OTP_CODE || process.env.TOTP_SECRET || process.env.ITIBARI_TOTP_SECRET;
    test.skip(!otpSecretOrCode, 'TOTP_SECRET, ITIBARI_TOTP_SECRET, or ITIBARI_OTP_CODE is not set');

    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();
    const loginPage = new _loginPage(page);

    await page.goto(_config.baseUrl);
    await loginPage.loginWith2FA(_config.username, _config.password, otpSecretOrCode!);
    await expect(page.locator('body')).not.toContainText(/login|sign in/i);

    await context.close();
  });

  test('should check Remember Me checkbox during login', {tag: '@Login'}, async ({ page, loginPage }) => {
    const rememberMeCount = await loginPage.rememberMeCheckbox.count();
    if (rememberMeCount === 0) {
      test.skip(true, 'Remember Me checkbox not found in UI');
      return;
    }
    await loginPage.loginWithCredentials(
      'd.chirchir@itibari.io',
      'dennis',
      true,
    );
    await page.waitForURL(/orders|dashboard|home/, { timeout: 15000 });
  });
});
