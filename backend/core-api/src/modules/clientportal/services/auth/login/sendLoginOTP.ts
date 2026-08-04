import { IModels } from '~/connectionResolvers';
import { IClientPortalDocument } from '@/clientportal/types/clientPortal';
import {
  detectIdentifierType,
  identifierTypeToActionCodeType,
} from '@/clientportal/services/helpers/validators';
import { checkOTPResendLimit } from './loginWithOTP';
import { sendAndStoreOTP } from '@/clientportal/services/helpers/otpSenderHelper';
import { isPasswordlessLoginEnabled } from '@/clientportal/services/helpers/otpConfigHelper';
import {
  RateLimitError,
  ValidationError,
} from '@/clientportal/services/errorHandler';

export async function sendOTPForLogin(
  subdomain: string,
  identifier: string,
  clientPortal: IClientPortalDocument,
  models: IModels,
): Promise<void> {
  const identifierType = detectIdentifierType(identifier);

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

  const oneHourMs = 60 * 60 * 1000;
  const lastAttemptMs = user.otpResendLastAttempt
    ? new Date(user.otpResendLastAttempt).getTime()
    : 0;
  const oneHourAgo = Date.now() - oneHourMs;
  const currentAttempts =
    lastAttemptMs > oneHourAgo ? user.otpResendAttempts || 0 : 0;

  const actionCodeType = identifierTypeToActionCodeType(identifierType);
  if (user.isVerified) {
    // if user is verified, send OTP for login
    if (!isPasswordlessLoginEnabled(clientPortal, identifierType)) {
      throw new ValidationError(
        'Passwordless login is not enabled for this identifier type',
      );
    }

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
        currentAttempts,
      },
    });
  } else {
    // if user is not verified, send OTP for registration
    await sendAndStoreOTP({
      user,
      identifierType,
      actionCodeType,
      context: 'registration',
      clientPortal,
      subdomain,
      models,
      resendOptions: {
        incrementResendAttempts: true,
        currentAttempts,
      },
    });
  }
}
