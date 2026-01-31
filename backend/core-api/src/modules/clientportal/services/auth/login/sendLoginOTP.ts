import { IModels } from '~/connectionResolvers';
import { IClientPortalDocument } from '@/clientportal/types/clientPortal';
import {
  detectIdentifierType,
  identifierTypeToActionCodeType,
} from '@/clientportal/services/helpers/validators';
import { checkOTPResendLimit } from './loginWithOTP';
import { sendAndStoreOTP } from '@/clientportal/services/helpers/otpSenderHelper';
import { isPasswordlessLoginEnabled } from '@/clientportal/services/helpers/otpConfigHelper';
import { RateLimitError, ValidationError } from '@/clientportal/services/errorHandler';

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
