import { test as setup } from '@playwright/test';
import fs from 'fs';
import _config from './config/configManager';
import { _loginPage } from './pageFactory/auth/login';

const authFile = 'playwright/.auth/user.json';
const otpSecretOrCode = process.env.ITIBARI_OTP_CODE || process.env.TOTP_SECRET || process.env.ITIBARI_TOTP_SECRET;

setup('authenticate', async ({ page }) => {
  setup.setTimeout(5 * 60 * 1000);

  console.log('\n=== AUTHENTICATION SETUP ===');
  console.log(`[SETUP] Target URL: ${_config.baseUrl}`);
  console.log(`[SETUP] Username: ${_config.username}`);

  const loginPage = new _loginPage(page);

  console.log('[SETUP] Navigating to application...');
  await page.goto(_config.baseUrl);
  await page.waitForLoadState('domcontentloaded');

  if (otpSecretOrCode) {
    console.log('[SETUP] 2FA/OTP enabled - using full authentication flow');
    console.log('[SETUP] OTP value detected from environment');

    try {
      await loginPage.loginWith2FA(
        _config.username,
        _config.password,
        otpSecretOrCode,
        false,
      );
      console.log('[SETUP] ✓ 2FA login successful');
    } catch (error) {
      console.error('[SETUP] ✗ 2FA login failed:', error);
      throw new Error(`2FA authentication failed: ${error}`);
    }
  } else {
    console.log('[SETUP] 2FA/OTP not provided - using manual MFA flow');
    console.log('[SETUP] Enter the authenticator code in the headed browser, then click Verify.');

    try {
      await loginPage.loginWithManual2FA(
        _config.username,
        _config.password,
        false,
      );
      console.log('[SETUP] ✓ Manual 2FA login successful');
    } catch (error) {
      console.error('[SETUP] ✗ Manual 2FA login failed:', error);
      throw new Error(`Manual 2FA authentication failed: ${error}`);
    }
  }

  console.log(`[SETUP] Saving authentication state to: ${authFile}`);
  fs.mkdirSync('playwright/.auth', { recursive: true });
  await page.context().storageState({ path: authFile });

  console.log('[SETUP] ✓ Authentication setup completed successfully');
  console.log('=== SETUP COMPLETE ===\n');
});
