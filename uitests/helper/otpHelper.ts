import OTPAuth from 'otpauth';

export class OTPHelper {
  static generateOTP(totpSecret: string, issuer: string = 'Itibari', email: string = ''): string {
    const totp = new OTPAuth.TOTP({
      issuer,
      label: email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: totpSecret,
    });

    return totp.generate();
  }

  static splitOTP(otp: string): string[] {
    return otp.split('');
  }

  static isValidOTPFormat(otp: string): boolean {
    return /^\d{6}$/.test(otp);
  }
}
