import OTPAuth from 'otpauth';

/**
 * OTP Helper - Manages One-Time Password generation and handling
 * 
 * This utility handles TOTP (Time-based One-Time Password) generation
 * for authentication flows that require 2FA with authenticator apps.
 */
export class OTPHelper {
  /**
   * Generates a 6-digit OTP code from a TOTP secret
   * 
   * @param totpSecret - The TOTP secret key (base32 encoded)
   * @param issuer - The service issuer name (e.g., 'Itibari')
   * @param email - The email/label associated with the OTP
   * @returns A 6-digit OTP code as a string
   * 
   * @example
   * const otp = OTPHelper.generateOTP(secret, 'Itibari', 'user@example.com');
   * console.log(otp); // '123456'
   */
  static generateOTP(totpSecret: string, issuer: string = 'Itibari', email: string = ''): string {
    const totp = new OTPAuth.TOTP({
      issuer,
      label: email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: totpSecret
    });

    const otp = totp.generate();
    console.log('[OTP] Generated 6-digit code');
    return otp;
  }

  /**
   * Splits an OTP code into individual digits
   * 
   * Useful for filling individual OTP input fields in the UI
   * 
   * @param otp - The 6-digit OTP code
   * @returns Array of individual digits
   * 
   * @example
   * const digits = OTPHelper.splitOTP('123456');
   * console.log(digits); // ['1', '2', '3', '4', '5', '6']
   */
  static splitOTP(otp: string): string[] {
    return otp.split('');
  }

  /**
   * Validates that an OTP code has the correct format
   * 
   * @param otp - The OTP code to validate
   * @returns True if the OTP is a valid 6-digit code
   */
  static isValidOTPFormat(otp: string): boolean {
    return /^\d{6}$/.test(otp);
  }
}
