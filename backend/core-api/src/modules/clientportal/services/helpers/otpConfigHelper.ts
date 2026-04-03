import { IClientPortalDocument } from '@/clientportal/types/clientPortal';
import { ValidationError } from '@/clientportal/services/errorHandler';

export interface OTPConfig {
  codeLength: number;
  duration: number;
  emailSubject: string;
  messageTemplate: string;
}

type OTPContext =
  | 'registration'
  | 'login'
  | 'passwordReset'
  | 'emailChange'
  | 'phoneChange';

const CONTEXT_SUBJECTS: Record<OTPContext, string> = {
  registration: 'Registration verification',
  login: 'Login OTP',
  passwordReset: 'Password Reset',
  emailChange: 'Confirm new email',
  phoneChange: 'Confirm new phone',
};

export function getOTPConfig(
  identifierType: 'email' | 'phone',
  clientPortal: IClientPortalDocument,
  context: OTPContext,
): OTPConfig {
  const otpConfig = clientPortal.securityAuthConfig?.otpConfig;

  if (!otpConfig) {
    throw new ValidationError(
      'OTP configuration is not set for this client portal',
    );
  }

  if (identifierType === 'email') {
    const emailConfig = otpConfig.email;

    if (!emailConfig) {
      throw new ValidationError(
        'Email OTP configuration is not set for this client portal',
      );
    }

    if (!emailConfig.codeLength || !emailConfig.duration) {
      throw new ValidationError('Email OTP configuration is incomplete');
    }

    return {
      codeLength: emailConfig.codeLength,
      duration: emailConfig.duration,
      emailSubject: emailConfig.emailSubject || CONTEXT_SUBJECTS[context],
      messageTemplate: emailConfig.messageTemplate || '',
    };
  }

  const smsConfig = otpConfig.sms;

  if (!smsConfig) {
    throw new ValidationError(
      'SMS OTP configuration is not set for this client portal',
    );
  }

  if (!smsConfig.codeLength || !smsConfig.duration) {
    throw new ValidationError('SMS OTP configuration is incomplete');
  }

  return {
    codeLength: smsConfig.codeLength,
    duration: smsConfig.duration,
    emailSubject: CONTEXT_SUBJECTS[context],
    messageTemplate: smsConfig.messageTemplate || '',
  };
}

export function isEmailVerificationEnabled(
  clientPortal: IClientPortalDocument,
): boolean {
  return (
    clientPortal.securityAuthConfig?.otpConfig?.email
      ?.enableEmailVerification ?? false
  );
}

export function isPhoneVerificationEnabled(
  clientPortal: IClientPortalDocument,
): boolean {
  return (
    clientPortal.securityAuthConfig?.otpConfig?.sms?.enablePhoneVerification ??
    false
  );
}

export function isPasswordlessLoginEnabled(
  clientPortal: IClientPortalDocument,
  identifierType: 'email' | 'phone',
): boolean {
  if (identifierType === 'email') {
    return (
      clientPortal.securityAuthConfig?.otpConfig?.email
        ?.enablePasswordlessLogin ?? false
    );
  }
  return (
    clientPortal.securityAuthConfig?.otpConfig?.sms?.enablePasswordlessLogin ??
    false
  );
}
