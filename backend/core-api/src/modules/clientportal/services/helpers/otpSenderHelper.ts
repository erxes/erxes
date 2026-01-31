import { IModels } from '~/connectionResolvers';
import { IClientPortalDocument } from '@/clientportal/types/clientPortal';
import { ICPUserDocument } from '@/clientportal/types/cpUser';
import { setActionCode, type ActionCodeType } from './actionCodeHelper';
import { getOTPConfig } from './otpConfigHelper';
import { generateVerificationCode } from './codeGenerator';
import { notificationService } from '@/clientportal/services/notification';
import type { SetActionCodeOptions } from './actionCodeHelper';

type OTPContext = 'registration' | 'login' | 'passwordReset';

export interface SendAndStoreOTPParams {
  user: ICPUserDocument;
  identifierType: 'email' | 'phone';
  actionCodeType: ActionCodeType;
  context: OTPContext;
  clientPortal: IClientPortalDocument;
  subdomain: string;
  models: IModels;
  resendOptions?: SetActionCodeOptions;
  emailSubject?: string;
  messageTemplate?: string;
}

/**
 * Shared flow: get OTP config, generate code, set action code on user, send OTP.
 * Used by registration verification, login OTP, and password reset (code mode).
 */
export async function sendAndStoreOTP(
  params: SendAndStoreOTPParams,
): Promise<void> {
  const {
    user,
    identifierType,
    actionCodeType,
    context,
    clientPortal,
    subdomain,
    models,
    resendOptions,
    emailSubject: subjectOverride,
    messageTemplate: templateOverride,
  } = params;

  const otpConfig = getOTPConfig(identifierType, clientPortal, context);
  const { code, codeExpires } = generateVerificationCode(
    otpConfig.codeLength,
    otpConfig.duration,
  );

  await setActionCode(
    user._id,
    { code, expires: codeExpires, type: actionCodeType },
    models,
    resendOptions,
  );

  const emailSubject = subjectOverride ?? otpConfig.emailSubject;
  const messageTemplate = templateOverride ?? otpConfig.messageTemplate;

  await notificationService.sendOTP(
    subdomain,
    user,
    identifierType,
    code,
    { emailSubject, messageTemplate },
    clientPortal,
    models,
  );
}
