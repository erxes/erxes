import { IModels } from '~/connectionResolvers';
import { IClientPortalDocument } from '@/clientportal/types/clientPortal';
import { ICPUserDocument } from '@/clientportal/types/cpUser';
import {
  detectIdentifierType,
  identifierTypeToActionCodeType,
} from './helpers/validators';
import { checkOTPResendLimit } from './otpService';
import { notificationService } from '@/clientportal/services/notification';
import { RateLimitError, ValidationError } from '@/clientportal/services/errorHandler';
import {
  validateActionCode,
  isActionCodeExpired,
  type ActionCodeType,
} from './helpers/actionCodeHelper';
import { generateVerificationCode as generateCode } from './helpers/codeGenerator';
import { sendAndStoreOTP } from './helpers/otpSenderHelper';
import { isPasswordlessLoginEnabled } from './helpers/otpConfigHelper';

const VALID_VERIFICATION_TYPES: ActionCodeType[] = [
  'EMAIL_VERIFICATION',
  'PHONE_VERIFICATION',
];

function isValidVerificationType(type: string): type is ActionCodeType {
  return VALID_VERIFICATION_TYPES.includes(type as ActionCodeType);
}

export function generateVerificationCode(
  length: number,
  expirationInMinutes: number,
): { code: string; codeExpires: Date } {
  return generateCode(length, expirationInMinutes);
}

export async function sendVerificationEmail(
  subdomain: string,
  user: ICPUserDocument,
  code: string,
  clientPortal: IClientPortalDocument,
  models: IModels,
): Promise<void> {
  if (!user.email) {
    return;
  }

  await notificationService.sendOTPEmail(
    subdomain,
    user,
    code,
    'Registration confirmation',
    '',
    models,
  );
}

export function validateVerificationCode(
  user: ICPUserDocument,
  code: number,
): void {
  if (!user.actionCode) {
    throw new ValidationError('No verification code found');
  }
  if (!isValidVerificationType(user.actionCode.type)) {
    throw new ValidationError('Invalid verification code type');
  }
  validateActionCode(user, code, user.actionCode.type as ActionCodeType);
}

export function isVerificationCodeExpired(user: ICPUserDocument): boolean {
  return isActionCodeExpired(user);
}

export async function sendOTPForLogin(
  subdomain: string,
  identifier: string,
  clientPortal: IClientPortalDocument,
  models: IModels,
): Promise<void> {
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
    throw new ValidationError('User not found');
  }

  if (!checkOTPResendLimit(user, clientPortal)) {
    throw new RateLimitError(
      'OTP resend limit exceeded. Please try again later.',
    );
  }

  const actionCodeType = identifierTypeToActionCodeType(identifierType);

  await sendAndStoreOTP({
    user,
    identifierType,
    actionCodeType,
    context: 'login',
    clientPortal,
    subdomain,
    models,
    resendOptions: {
      incrementResendAttempts: true,
      currentAttempts: user.otpResendAttempts || 0,
    },
  });
}
