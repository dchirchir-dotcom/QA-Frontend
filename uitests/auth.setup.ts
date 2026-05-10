import { test as setup } from '@playwright/test';
import fs from 'fs';
import _config from './config/configManager';
import { _loginPage } from './pageFactory/auth/login';

const authFile = 'playwright/.auth/user.json';
const otpSecretOrCode = process.env.ITIBARI_OTP_CODE || process.env.TOTP_SECRET || process.env.ITIBARI_TOTP_SECRET;

setup('authenticate', async ({ page }) => {
  setup.setTimeout(5 * 60 * 1000);

  const loginPage = new _loginPage(page);

  await page.goto(_config.baseUrl);
  await page.waitForLoadState('domcontentloaded');

  if (otpSecretOrCode) {
    try {
      await loginPage.loginWith2FA(
        _config.username,
        _config.password,
        otpSecretOrCode,
        false,
      );
    } catch (error) {
      console.error('[SETUP] ✗ 2FA login failed:', error);
      throw new Error(`2FA authentication failed: ${error}`);
    }
  } else {
    try {
      await loginPage.loginWithManual2FA(
        _config.username,
        _config.password,
        false,
      );
    } catch (error) {
      console.error('[SETUP] ✗ Manual 2FA login failed:', error);
      throw new Error(`Manual 2FA authentication failed: ${error}`);
    }
  }

  fs.mkdirSync('playwright/.auth', { recursive: true });
  await page.context().storageState({ path: authFile });
});
