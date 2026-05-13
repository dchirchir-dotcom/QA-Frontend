import { expect, Locator, Page } from '@playwright/test';
import { OTPHelper } from '../../helper/otpHelper';
import { assertionText } from '../../helper/assertionText';
import { authLocators } from '../../helper/locators';

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
    this.usernameInput = authLocators.usernameInput(page);
    this.passwordInput = authLocators.passwordInput(page);
    this.rememberMeCheckbox = authLocators.rememberMeCheckbox(page);
    this.loginButton = authLocators.loginButton(page);
    this.otpInputs = authLocators.otpInputs(page);
    this.otpSubmitButton = authLocators.otpSubmitButton(page);
    this.avatarImg = authLocators.avatarImg(page);
    this.salesDiv = authLocators.salesLink(page);
    this.ordersLink = authLocators.ordersLink(page);
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
    await this.waitForLoginSuccess(5 * 60 * 1000);
  }

  private async fillCredentials(username: string, password: string) {
    await this.fillInput(this.usernameInput, username);
    await this.fillInput(this.passwordInput, password);
    await expect(this.usernameInput).toHaveValue(username);
    await expect(this.passwordInput).toHaveValue(password);
    await authLocators.signInButton(this.page).click();
  }

  private async fillInput(input: Locator, value: string) {
    await input.click();
    await input.clear();
    await input.pressSequentially(value, { delay: 50 });
    await input.blur();
  }

  private async acknowledgeOTPSentPrompt(timeout = 30000) {
    const okayButton = authLocators.otpOkayButton(this.page);

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

      expect(loginFormVisible, assertionText.auth.loginFormHidden).toBeFalsy();
      expect(otpPromptVisible, assertionText.auth.otpPromptHidden).toBeFalsy();
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
