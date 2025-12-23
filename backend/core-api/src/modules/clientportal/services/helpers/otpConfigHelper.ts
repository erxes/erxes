import { IClientPortalDocument } from '@/clientportal/types/clientPortal';
import { VERIFICATION_CODE_CONFIG } from '@/clientportal/constants';

export interface OTPConfig {
  codeLength: number;
  duration: number;
  emailSubject: string;
  messageTemplate: string;
}

type OTPContext = 'registration' | 'login' | 'passwordReset';

const CONTEXT_SUBJECTS: Record<OTPContext, string> = {
  registration: 'Registration verification',
  login: 'Login OTP',
  passwordReset: 'Password Reset',
};

export function getOTPConfig(
  identifierType: 'email' | 'phone',
  clientPortal: IClientPortalDocument,
  context: OTPContext,
  defaultExpirationSeconds: number = VERIFICATION_CODE_CONFIG.DEFAULT_EXPIRATION_SECONDS,
): OTPConfig {
  const otpConfig = clientPortal.securityAuthConfig?.otpConfig;

  const defaults: OTPConfig = {
    codeLength: VERIFICATION_CODE_CONFIG.DEFAULT_LENGTH,
    duration: defaultExpirationSeconds,
    emailSubject: CONTEXT_SUBJECTS[context],
    messageTemplate: '',
  };

  if (identifierType === 'email') {
    const emailConfig = otpConfig?.email;

    if (!emailConfig) {
      return defaults;
    }

    return {
      codeLength: emailConfig.codeLength ?? defaults.codeLength,
      duration: emailConfig.duration ?? defaults.duration,
      emailSubject: emailConfig.emailSubject ?? defaults.emailSubject,
      messageTemplate: emailConfig.messageTemplate ?? defaults.messageTemplate,
    };
  }

  const smsConfig = otpConfig?.sms;

  if (!smsConfig) {
    return defaults;
  }

  return {
    codeLength: smsConfig.codeLength ?? defaults.codeLength,
    duration: smsConfig.duration ?? defaults.duration,
    emailSubject: defaults.emailSubject,
    messageTemplate: smsConfig.messageTemplate ?? defaults.messageTemplate,
  };
}


