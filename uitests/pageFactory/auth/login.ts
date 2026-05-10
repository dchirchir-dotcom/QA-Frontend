import { expect, Locator, Page } from '@playwright/test';
import { OTPHelper } from '../../helper/otpHelper';

export class _loginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly loginButton: Locator;
  readonly otpInputs: Locator;
  readonly otpSubmitButton: Locator;
  readonly avatarImg: Locator;
  readonly salesDiv: Locator;
  readonly ordersLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByPlaceholder('Enter Email');

    this.passwordInput = page.getByPlaceholder(/password/i)
      .or(page.getByLabel(/password/i))
      .or(page.locator('#password'))
      .or(page.locator('input[name="password"]'))
      .or(page.locator('input[type="password"]'))
      .first();

    this.rememberMeCheckbox = page.locator('#autoLogin').or(page.locator('input[type="checkbox"]')).first();
    this.loginButton = page.getByRole('button', { name: /login|sign in|submit|authenticate/i })
      .or(page.locator('button[type="submit"]'))
      .or(page.locator('form button').first())
      .first();

    this.otpInputs = page.locator('.ant-otp input')
      .or(page.locator('input[aria-label*="OTP" i]'))
      .or(page.locator('input[autocomplete="one-time-code"]'))
      .or(page.locator('input[inputmode="numeric"]'))
      .or(page.locator('input[name*="otp" i], input[name*="code" i], input[id*="otp" i], input[id*="code" i]'))
      .or(page.getByLabel(/otp|code|authenticator|verification|mfa|2fa/i))
      .or(page.getByPlaceholder(/otp|code|authenticator|verification|mfa|2fa/i));

    this.otpSubmitButton = page.getByRole('button', { name: /verify|submit|confirm|complete/i })
      .or(page.locator('button[type="submit"]'))
      .first();

    this.avatarImg = page.getByRole('img', { name: /avatar/i });
    this.salesDiv = page.getByRole('link', { name: 'Sales' });
    this.ordersLink = page.getByRole('link', { name: 'Orders' });
  }

  async login(username: string, password: string) {
    await this.loginWithCredentials(username, password);
  }

  async loginWithCredentials(
    username: string,
    password: string,
    rememberMe = false,
    waitForSuccess = true,
  ) {
    await this.fillCredentials(username, password);
  }

  async loginWith2FA(
    username: string,
    password: string,
    otpSecretOrCode: string,
    rememberMe = false,
  ) {
    await this.loginWithCredentials(username, password, rememberMe, false);
    await this.acknowledgeOTPSentPrompt();
    await this.waitForOTPPrompt();

    const otp = OTPHelper.isValidOTPFormat(otpSecretOrCode)
      ? otpSecretOrCode
      : OTPHelper.generateOTP(otpSecretOrCode, 'Itibari', username);

    await this.fillOTPInputs(otp);
    await this.submitOTP();
    await this.waitForLoginSuccess();
  }

  async loginWithManual2FA(username: string, password: string, rememberMe = false) {
    await this.loginWithCredentials(username, password, rememberMe, false);
    await this.acknowledgeOTPSentPrompt();
    await this.waitForOTPPrompt();
    console.log('[LOGIN-2FA] Enter the authenticator code in the browser, then click Verify.');
    await this.waitForLoginSuccess(5 * 60 * 1000);
  }

  async navigateToOrders() {
    await this.salesDiv.click();
    await this.ordersLink.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async debugPage() {
    console.log('\n========== PAGE DEBUG INFO ==========');
    console.log(`[DEBUG] Current URL: ${this.page.url()}`);
    console.log(`[DEBUG] Page title: ${await this.page.title()}`);
    console.log(`[DEBUG] Input count: ${await this.page.locator('input').count()}`);
    console.log(`[DEBUG] Button texts: ${(await this.page.locator('button').allTextContents()).join(', ')}`);
    console.log(`[DEBUG] Username input count: ${await this.usernameInput.count()}`);
    console.log(`[DEBUG] Password input count: ${await this.passwordInput.count()}`);
    console.log(`[DEBUG] Login button count: ${await this.loginButton.count()}`);
    console.log('=====================================\n');
  }

  private async fillCredentials(username: string, password: string) {
    await this.fillInput(this.usernameInput, username);
    await this.fillInput(this.passwordInput, password);
    await expect(this.usernameInput).toHaveValue(username);
    await expect(this.passwordInput).toHaveValue(password);
    await this.page.getByRole('button', { name: 'Sign In' }).click();
  }

  private async fillInput(input: Locator, value: string) {
    await input.click();
    await input.clear();
    await input.pressSequentially(value, { delay: 50 });
    await input.blur();
  }

  private async acknowledgeOTPSentPrompt(timeout = 30000) {
    const okayButton = this.page.getByRole('button', { name: /okay|ok|continue/i }).first();

    await expect(okayButton).toBeVisible({ timeout });
    await okayButton.click();
    await this.page.waitForURL(/verification-code|verify|otp|mfa|2fa/i, { timeout: 10000 }).catch(() => {});
  }

  private async waitForOTPPrompt(timeout = 30000) {
    await expect(this.otpInputs.first()).toBeVisible({ timeout });
  }

  private async fillOTPInputs(otp: string) {
    if (!OTPHelper.isValidOTPFormat(otp)) {
      throw new Error('OTP must be a 6-digit code');
    }

    const inputs = this.otpInputs;
    const inputCount = await inputs.count();

    if (inputCount === 0) {
      throw new Error('No OTP input fields found');
    }

    if (inputCount === 1) {
      await inputs.first().fill(otp);
      return;
    }

    const digits = OTPHelper.splitOTP(otp);
    for (let index = 0; index < Math.min(inputCount, digits.length); index++) {
      await inputs.nth(index).fill(digits[index]);
    }
  }

  private async submitOTP() {
    if (await this.otpSubmitButton.count() === 0) return;
    await this.otpSubmitButton.click();
  }

  private async waitForLoginSuccess(timeout = 20000) {
    await expect(async () => {
      const loginFormVisible = await this.isLoginFormVisible();
      const otpPromptVisible = await this.otpInputs.first().isVisible().catch(() => false);
      const tokenPresent = await this.hasAuthenticatedState();
      const avatarVisible = await this.avatarImg.isVisible().catch(() => false);
      const authenticatedUrl = /dashboard|orders|home|system|sales|user-management/i.test(this.page.url());

      expect(loginFormVisible, 'login form should not still be visible').toBeFalsy();
      expect(otpPromptVisible, 'OTP prompt should not still be visible').toBeFalsy();
      expect(tokenPresent || avatarVisible || authenticatedUrl).toBeTruthy();
    }).toPass({ timeout });

    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  private async isLoginFormVisible() {
    const usernameVisible = await this.usernameInput.isVisible().catch(() => false);
    const passwordVisible = await this.passwordInput.isVisible().catch(() => false);
    const loginButtonVisible = await this.loginButton.isVisible().catch(() => false);
    return usernameVisible && passwordVisible && loginButtonVisible;
  }

  private async hasAuthenticatedState() {
    return this.page.evaluate(() => Boolean(window.localStorage.getItem('itibari_t'))).catch(() => false);
  }
}
