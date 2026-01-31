import { random } from 'erxes-api-shared/utils';

/**
 * Generates a numeric verification code and its expiration time.
 * Used by OTP flows (registration, login, password reset) without depending on verificationService.
 */
export function generateVerificationCode(
  length: number,
  expirationInMinutes: number,
): { code: string; codeExpires: Date } {
  const code = random('0', length);
  const codeExpires = new Date(
    Date.now() + expirationInMinutes * 60 * 1000,
  );

  return { code, codeExpires };
}
