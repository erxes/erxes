import { IModels } from '~/connectionResolvers';
import { IClientPortalDocument } from '@/clientportal/types/clientPortal';
import { ICPUserDocument } from '@/clientportal/types/cpUser';
import { updateLastLogin } from '@/clientportal/services/helpers/userUtils';
import {
  detectIdentifierType,
  identifierTypeToActionCodeType,
} from '@/clientportal/services/helpers/validators';
import { validateActionCode } from '@/clientportal/services/helpers/actionCodeHelper';
import { isPasswordlessLoginEnabled } from '@/clientportal/services/helpers/otpConfigHelper';
import { isTestAccountMatch } from '@/clientportal/services/helpers/testUserHelper';
import {
  AuthenticationError,
  ValidationError,
} from '@/clientportal/services/errorHandler';

const DEFAULT_OTP_RESEND_CONFIG = {
  cooldownPeriodInSeconds: 60,
  maxAttemptsPerHour: 5,
};

const ONE_HOUR_MS = 60 * 60 * 1000;

function getOTPResendConfig(clientPortal: IClientPortalDocument): {
  cooldownPeriodInSeconds: number;
  maxAttemptsPerHour: number;
} {
  const config = clientPortal.securityAuthConfig?.otpResendConfig;
  return {
    cooldownPeriodInSeconds:
      config?.cooldownPeriodInSeconds ??
      DEFAULT_OTP_RESEND_CONFIG.cooldownPeriodInSeconds,
    maxAttemptsPerHour:
      config?.maxAttemptsPerHour ??
      DEFAULT_OTP_RESEND_CONFIG.maxAttemptsPerHour,
  };
}

function isWithinCooldown(
  lastAttempt: Date | null,
  cooldownPeriodInSeconds: number,
): boolean {
  if (!lastAttempt) {
    return false;
  }

  const cooldownMs = cooldownPeriodInSeconds * 1000;
  const timeSinceLastAttempt = Date.now() - lastAttempt.getTime();

  return timeSinceLastAttempt < cooldownMs;
}

function isExceedingHourlyLimit(
  lastAttempt: Date | null,
  attempts: number,
  maxAttemptsPerHour: number,
): boolean {
  if (!lastAttempt) {
    return false;
  }

  const oneHourAgo = new Date(Date.now() - ONE_HOUR_MS);
  const isWithinLastHour = lastAttempt > oneHourAgo;

  return isWithinLastHour && attempts >= maxAttemptsPerHour;
}

export async function loginWithOTP(
  identifier: string,
  otp: string,
  clientPortal: IClientPortalDocument,
  models: IModels,
): Promise<ICPUserDocument> {
  const identifierType = detectIdentifierType(identifier);

  if (!isPasswordlessLoginEnabled(clientPortal, identifierType)) {
    throw new ValidationError(
      'Passwordless login is not enabled for this identifier type',
    );
  }

  const user = await models.CPUser.findByIdentifier(
    identifier,
    identifierType,
    clientPortal._id,
  );

  if (!user) {
    throw new AuthenticationError('Invalid login');
  }
  if (!user.isVerified) {
    throw new AuthenticationError('Verify your account first');
  }

  const expectedType = identifierTypeToActionCodeType(identifierType);
  const hasTestOtp = clientPortal.testUser?.otp !== undefined;
  const isTestAccount = isTestAccountMatch(clientPortal, user);
  const isMatchingTestOtp =
    hasTestOtp &&
    String(otp).trim() === String(clientPortal.testUser?.otp ?? '');
  console.log('hasTestOtp', hasTestOtp);
  console.log('isTestAccount', isTestAccount);
  console.log('isMatchingTestOtp', isMatchingTestOtp);
  if (!(hasTestOtp && isTestAccount && isMatchingTestOtp)) {
    validateActionCode(user, otp, expectedType);
  }

  await updateLastLogin(user._id, models);

  return user;
}

export function checkOTPResendLimit(
  user: ICPUserDocument,
  clientPortal: IClientPortalDocument,
): boolean {
  const config = getOTPResendConfig(clientPortal);
  const lastAttempt = user.otpResendLastAttempt
    ? new Date(user.otpResendLastAttempt)
    : null;
  const attempts = user.otpResendAttempts || 0;
  if (isWithinCooldown(lastAttempt, config.cooldownPeriodInSeconds)) {
    return false;
  }

  if (
    isExceedingHourlyLimit(lastAttempt, attempts, config.maxAttemptsPerHour)
  ) {
    return false;
  }

  return true;
}
