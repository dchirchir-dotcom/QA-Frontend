import { test as setup } from '@playwright/test';
import fs from 'fs';
import _config from './config/configManager';
import { _loginPage } from './pageFactory/auth/login';

const authFile = 'playwright/.auth/user.json';

/**
 * AUTHENTICATION SETUP
 * 
 * This setup runs before all test projects and handles:
 * 1. Logging in with credentials
 * 2. Handling 2FA/OTP if enabled
 * 3. Saving browser session state for test reuse
 * 
 * The saved session is used by all test projects, reducing login time
 * and improving test performance.
 * 
 * To use 2FA:
 * Set TOTP_SECRET environment variable with your TOTP secret key
 * Example: TOTP_SECRET=JBSWY3DPEBLW64TMMQQQ==== npm test
 */
setup('authenticate', async ({ page }) => {
  setup.setTimeout(5 * 60 * 1000);

  console.log('\n=== AUTHENTICATION SETUP ===');
  console.log(`[SETUP] Target URL: ${_config.baseUrl}`);
  console.log(`[SETUP] Username: ${_config.username}`);
  
  // Initialize login page object
  const loginPage = new _loginPage(page);
  
  // Navigate to application
  console.log('[SETUP] Navigating to application...');
  await page.goto(_config.baseUrl);
  await page.waitForLoadState('domcontentloaded');
  
  // Check if 2FA/OTP is enabled via environment variable
  const otpSecretOrCode = process.env.ITIBARI_OTP_CODE || process.env.TOTP_SECRET || process.env.ITIBARI_TOTP_SECRET;
  
  if (otpSecretOrCode) {
    // Login WITH 2FA/OTP
    console.log('[SETUP] 2FA/OTP enabled - using full authentication flow');
    console.log('[SETUP] OTP value detected from environment');
    
    try {
      await loginPage.loginWith2FA(
        _config.username,
        _config.password,
        otpSecretOrCode,
        false // rememberMe
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
        false // rememberMe
      );
      console.log('[SETUP] ✓ Manual 2FA login successful');
    } catch (error) {
      console.error('[SETUP] ✗ Manual 2FA login failed:', error);
      throw new Error(`Manual 2FA authentication failed: ${error}`);
    }
  }
  
  // Save authentication state for reuse across test projects
  console.log(`[SETUP] Saving authentication state to: ${authFile}`);
  fs.mkdirSync('playwright/.auth', { recursive: true });
  await page.context().storageState({ path: authFile });
  
  console.log('[SETUP] ✓ Authentication setup completed successfully');
  console.log('=== SETUP COMPLETE ===\n');
});
