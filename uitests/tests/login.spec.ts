import { expect } from '@playwright/test';
import test from '../helper/baseTest';
import _config from '../config/configManager';
import { _loginPage } from '../pageFactory/auth/login';

test.beforeEach(async ({ common }) => {
  console.log('\n[TEST] Loading site...');
  await common.loadSite();
});

test.describe('Authentication - Login Flow', () => {
  test('should login with valid credentials', {
    tag: '@Login',
    annotation: {
      type: 'critical',
      description: 'User authentication with email/password',
    },
  }, async ({ page, common, loginPage }) => {
    console.log('\n[TEST] Test: Login with valid credentials');

    try {
      await loginPage.debugPage();
      await loginPage.loginWithCredentials(
        'd.chirchir@itibari.io',
        'ebb0',
      );

      await page.waitForURL(/orders|dashboard|home/, { timeout: 15000 });

      console.log('[TEST] ✓ User successfully logged in and navigated');
    } catch (error) {
      console.error('[TEST] ✗ Login test failed:', error);
      await loginPage.debugPage();
      throw error;
    }
  });

  test('should login with 2FA/OTP authentication', { tag: '@Login' }, async ({ browser }) => {
    const otpSecretOrCode = process.env.ITIBARI_OTP_CODE || process.env.TOTP_SECRET || process.env.ITIBARI_TOTP_SECRET;
    test.skip(!otpSecretOrCode, 'TOTP_SECRET, ITIBARI_TOTP_SECRET, or ITIBARI_OTP_CODE is not set');

    console.log('\n[TEST] Test: Login with 2FA/OTP');

    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();
    const loginPage = new _loginPage(page);

    await page.goto(_config.baseUrl);
    await loginPage.loginWith2FA(_config.username, _config.password, otpSecretOrCode!);
    await expect(page.locator('body')).not.toContainText(/login|sign in/i);

    await context.close();
    console.log('[TEST] ✓ User successfully logged in with 2FA and navigated');
  });

  test('should navigate to Orders after login', {
    tag: '@Login',
    annotation: {
      type: 'smoke',
      description: 'Post-login navigation to Orders section',
    },
  }, async ({ page, loginPage }) => {
    console.log('\n[TEST] Test: Navigate to Orders');

    try {
      const currentUrl = page.url();
      const isLoggedIn = /orders|dashboard|home/.test(currentUrl);

      if (!isLoggedIn) {
        console.log('[TEST] Not yet logged in, performing login...');
        await loginPage.debugPage();
        await loginPage.loginWithCredentials(
          _config.username,
          _config.password
        );
      }

      await loginPage.navigateToOrders();
      await page.waitForURL(/orders/, { timeout: 10000 });

      console.log('[TEST] ✓ Successfully navigated to Orders page');
    } catch (error) {
      console.error('[TEST] ✗ Navigation test failed:', error);
      await loginPage.debugPage();
      throw error;
    }
  });

  test('should check Remember Me checkbox during login', {
    tag: '@Login',
    annotation: {
      type: 'functional',
      description: 'Remember Me checkbox functionality',
    },
  }, async ({ page, loginPage }) => {
    console.log('\n[TEST] Test: Remember Me checkbox');

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

    console.log('[TEST] ✓ Login with Remember Me completed successfully');
  });
});
