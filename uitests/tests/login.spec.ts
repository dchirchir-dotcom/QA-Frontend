import { expect } from '@playwright/test';
import test from '../helper/baseTest';
import _config from '../config/configManager';
import { _loginPage } from '../pageFactory/auth/login';

/**
 * LOGIN TEST SUITE
 * 
 * Tests core authentication flows including:
 * - Standard login (username/password)
 * - 2FA/OTP login (with TOTP secret)
 * - Post-login navigation
 * 
 * Note: These tests assume the auth.setup.ts has already run and
 * saved session state. The page should auto-navigate to dashboard
 * if already authenticated.
 * 
 * @tag @Login - Login-related tests
 */
test.beforeEach(async ({ common }) => {
  console.log('\n[TEST] Loading site...');
  await common.loadSite();
});

test.describe('Authentication - Login Flow', () => {
  
  /**
   * Test 1: Basic login with credentials
   * 
   * Verifies that users can log in with email and password,
   * and the application navigates to the authenticated dashboard
  //  */
  test('should login with valid credentials', {
    tag: '@Login',
    annotation: {
      type: 'critical',
      description: 'User authentication with email/password'
    }
  }, async ({ page, common, loginPage }) => {
    console.log('\n[TEST] Test: Login with valid credentials');
    
    try {
      // Debug: show page info before login attempt
      await loginPage.debugPage();
      
      // Perform login
      await loginPage.loginWithCredentials(
        'd.chirchir@itibari.io',
        'ebb0'
      );
      
      // Verify successful navigation
      // The page should navigate to orders, dashboard, or home
      await page.waitForURL(/orders|dashboard|home/, { timeout: 15000 });
      
      console.log('[TEST] ✓ User successfully logged in and navigated');
    } catch (error) {
      console.error('[TEST] ✗ Login test failed:', error);
      // Debug info on failure
      await loginPage.debugPage();
      throw error;
    }
  });

  /**
   * Test 2: Login with 2FA/OTP
   * 
   * Verifies that users can complete authentication when 2FA is enabled,
   * including OTP generation and verification
   * 
   * Prerequisites:
   * - TOTP_SECRET environment variable must be set
   * 
   * Example: TOTP_SECRET=JBSWY3DPEBLW64TMMQQQ==== npm run test:login
   * 
   * NOTE: This test is skipped if TOTP_SECRET is not provided
   */
  test('should login with 2FA/OTP authentication', {tag: '@Login'}, async ({ browser }) => {
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

  /**
   * Test 3: Navigate to Orders after login
   * 
   * Verifies that users can navigate through the application
   * after successful authentication
   */
  test('should navigate to Orders after login', {
    tag: '@Login',
    annotation: {
      type: 'smoke',
      description: 'Post-login navigation to Orders section'
    }
  }, async ({ page, loginPage }) => {
    console.log('\n[TEST] Test: Navigate to Orders');
    
    try {
      // This test assumes we're already logged in (via auth.setup)
      // If not logged in, perform login
      const isLoggedIn = await page.url().includes('orders') || 
                         await page.url().includes('dashboard') ||
                         await page.url().includes('home');
      
      if (!isLoggedIn) {
        console.log('[TEST] Not yet logged in, performing login...');
        await loginPage.debugPage();
        await loginPage.loginWithCredentials(
          _config.username,
          _config.password
        );
      }
      
      // Navigate to Orders
      await loginPage.navigateToOrders();
      
      // Verify we're on the Orders page
      await page.waitForURL(/orders/, { timeout: 10000 });
      
      console.log('[TEST] ✓ Successfully navigated to Orders page');
    } catch (error) {
      console.error('[TEST] ✗ Navigation test failed:', error);
      await loginPage.debugPage();
      throw error;
    }
  });

  /**
   * Test 4: Remember Me checkbox
   * 
   * Verifies that the "Remember Me" checkbox works correctly
   * (if available in the UI)
   */
  test('should check Remember Me checkbox during login', {
    tag: '@Login',
    annotation: {
      type: 'functional',
      description: 'Remember Me checkbox functionality'
    }
  }, async ({ page, loginPage }) => {
    console.log('\n[TEST] Test: Remember Me checkbox');
    
    // Check if Remember Me checkbox exists
    const rememberMeCount = await loginPage.rememberMeCheckbox.count();
    
    if (rememberMeCount === 0) {
      test.skip(true, 'Remember Me checkbox not found in UI');
      return;
    }
    
    // Login with Remember Me enabled
    await loginPage.loginWithCredentials(
      'd.chirchir@itibari.io',
      'dennis',
      true // rememberMe = true
    );
    
    // Verify successful login
    await page.waitForURL(/orders|dashboard|home/, { timeout: 15000 });
    
    console.log('[TEST] ✓ Login with Remember Me completed successfully');
  });
});
