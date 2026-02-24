import { IModels } from '~/connectionResolvers';
import { IClientPortalDocument } from '@/clientportal/types/clientPortal';
import { ICPUserDocument } from '@/clientportal/types/cpUser';
import { normalizeEmail } from '@/clientportal/utils';
import { validateEmail, validatePhone } from '@/clientportal/services/helpers/validators';
import { getCPUserByIdOrThrow, assertContactChangeUnique } from '@/clientportal/services/helpers/userUtils';
import { checkOTPResendLimit } from '@/clientportal/services/auth/login/loginWithOTP';
import { getOTPConfig } from '@/clientportal/services/helpers/otpConfigHelper';
import { generateVerificationCode } from '@/clientportal/services/helpers/codeGenerator';
import {
  setActionCode,
  validateActionCode,
} from '@/clientportal/services/helpers/actionCodeHelper';
import { notificationService } from '@/clientportal/services/notification';
import {
  RateLimitError,
  TokenExpiredError,
  ValidationError,
} from '@/clientportal/services/errorHandler';

export async function requestChangeEmail(
  userId: string,
  newEmail: string,
  clientPortal: IClientPortalDocument,
  models: IModels,
  subdomain: string,
): Promise<void> {
  const user = await getCPUserByIdOrThrow(userId, models);
  const normalizedEmail = normalizeEmail(newEmail);

  validateEmail(normalizedEmail);

  if (user.email && normalizeEmail(user.email) === normalizedEmail) {
    await models.CPUser.updateOne(
      { _id: userId },
      { $unset: { pendingEmail: '', actionCode: '' } },
    );
    return;
  }

  await assertContactChangeUnique(
    user.clientPortalId,
    userId,
    { email: normalizedEmail },
    models,
  );

  if (!checkOTPResendLimit(user, clientPortal)) {
    throw new RateLimitError(
      'OTP resend limit exceeded. Please try again later.',
    );
  }

  const oneHourMs = 60 * 60 * 1000;
  const lastAttemptMs = user.otpResendLastAttempt
    ? new Date(user.otpResendLastAttempt).getTime()
    : 0;
  const oneHourAgo = Date.now() - oneHourMs;
  const currentAttempts =
    lastAttemptMs > oneHourAgo ? user.otpResendAttempts || 0 : 0;

  await models.CPUser.updateOne(
    { _id: userId },
    { $set: { pendingEmail: normalizedEmail } },
  );

  const otpConfig = getOTPConfig('email', clientPortal, 'emailChange');
  const { code, codeExpires } = generateVerificationCode(
    otpConfig.codeLength,
    otpConfig.duration,
  );

  await setActionCode(
    userId,
    { code, expires: codeExpires, type: 'EMAIL_CHANGE' },
    models,
    { incrementResendAttempts: true, currentAttempts },
  );

  const refreshedUser = await models.CPUser.findOne({ _id: userId }).lean();
  await notificationService.sendOTP(
    subdomain,
    refreshedUser as ICPUserDocument,
    'email',
    code,
    {
      emailSubject: otpConfig.emailSubject,
      messageTemplate: otpConfig.messageTemplate,
    },
    clientPortal,
    models,
    { email: normalizedEmail },
  );
}

export async function confirmChangeEmail(
  userId: string,
  code: string,
  models: IModels,
): Promise<ICPUserDocument> {
  const user = await getCPUserByIdOrThrow(userId, models);

  if (!user.pendingEmail) {
    throw new ValidationError('No pending email change');
  }

  if (!user.actionCode) {
    throw new ValidationError('No verification code found');
  }

  if (user.actionCode.type !== 'EMAIL_CHANGE') {
    throw new ValidationError('Invalid verification code type');
  }

  if (new Date(user.actionCode.expires) < new Date()) {
    throw new TokenExpiredError('Verification code has expired');
  }

  validateActionCode(user, code, 'EMAIL_CHANGE');

  await models.CPUser.updateOne(
    { _id: userId },
    {
      $set: { email: user.pendingEmail, isEmailVerified: true },
      $unset: { pendingEmail: '', actionCode: '' },
    },
  );

  return getCPUserByIdOrThrow(userId, models);
}

export async function requestChangePhone(
  userId: string,
  newPhone: string,
  clientPortal: IClientPortalDocument,
  models: IModels,
  subdomain: string,
): Promise<void> {
  const user = await getCPUserByIdOrThrow(userId, models);
  const trimmedPhone = (newPhone || '').trim();

  validatePhone(trimmedPhone);

  if (user.phone && (user.phone || '').trim() === trimmedPhone) {
    await models.CPUser.updateOne(
      { _id: userId },
      { $unset: { pendingPhone: '', actionCode: '' } },
    );
    return;
  }

  await assertContactChangeUnique(
    user.clientPortalId,
    userId,
    { phone: trimmedPhone },
    models,
  );

  if (!checkOTPResendLimit(user, clientPortal)) {
    throw new RateLimitError(
      'OTP resend limit exceeded. Please try again later.',
    );
  }

  const oneHourMs = 60 * 60 * 1000;
  const lastAttemptMs = user.otpResendLastAttempt
    ? new Date(user.otpResendLastAttempt).getTime()
    : 0;
  const oneHourAgo = Date.now() - oneHourMs;
  const currentAttempts =
    lastAttemptMs > oneHourAgo ? user.otpResendAttempts || 0 : 0;

  await models.CPUser.updateOne(
    { _id: userId },
    { $set: { pendingPhone: trimmedPhone } },
  );

  const otpConfig = getOTPConfig('phone', clientPortal, 'phoneChange');
  const { code, codeExpires } = generateVerificationCode(
    otpConfig.codeLength,
    otpConfig.duration,
  );

  await setActionCode(
    userId,
    { code, expires: codeExpires, type: 'PHONE_CHANGE' },
    models,
    { incrementResendAttempts: true, currentAttempts },
  );

  const refreshedUser = await models.CPUser.findOne({ _id: userId }).lean();
  await notificationService.sendOTP(
    subdomain,
    refreshedUser as ICPUserDocument,
    'phone',
    code,
    {
      emailSubject: otpConfig.emailSubject,
      messageTemplate: otpConfig.messageTemplate,
    },
    clientPortal,
    models,
    { phone: trimmedPhone },
  );
}

export async function confirmChangePhone(
  userId: string,
  code: string,
  models: IModels,
): Promise<ICPUserDocument> {
  const user = await getCPUserByIdOrThrow(userId, models);

  if (!user.pendingPhone) {
    throw new ValidationError('No pending phone change');
  }

  if (!user.actionCode) {
    throw new ValidationError('No verification code found');
  }

  if (user.actionCode.type !== 'PHONE_CHANGE') {
    throw new ValidationError('Invalid verification code type');
  }

  if (new Date(user.actionCode.expires) < new Date()) {
    throw new TokenExpiredError('Verification code has expired');
  }

  validateActionCode(user, code, 'PHONE_CHANGE');

  await models.CPUser.updateOne(
    { _id: userId },
    {
      $set: { phone: user.pendingPhone, isPhoneVerified: true },
      $unset: { pendingPhone: '', actionCode: '' },
    },
  );

  return getCPUserByIdOrThrow(userId, models);
}
