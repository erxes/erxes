import { random } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { IClientPortalDocument } from '@/clientportal/types/clientPortal';
import { ICPUserDocument } from '@/clientportal/types/cpUser';
import { VERIFICATION_CODE_CONFIG } from '../constants';
import { detectIdentifierType } from './helpers/validators';
import { otpService } from './otpService';
import { notificationService } from './notificationService';
import { RateLimitError, ValidationError } from './errorHandler';

const VALID_VERIFICATION_TYPES = ['EMAIL_VERIFICATION', 'PHONE_VERIFICATION'];

export class VerificationService {
  generateVerificationCode(
    length: number = VERIFICATION_CODE_CONFIG.DEFAULT_LENGTH,
    expirationInSeconds: number = VERIFICATION_CODE_CONFIG.DEFAULT_EXPIRATION_SECONDS,
  ): { code: string; codeExpires: Date } {
    const code = random('0', length);
    const codeExpires = new Date(Date.now() + expirationInSeconds * 1000);

    return { code, codeExpires };
  }

  async sendVerificationEmail(
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

  private isValidVerificationType(type: string): boolean {
    return VALID_VERIFICATION_TYPES.includes(type);
  }

  validateVerificationCode(user: ICPUserDocument, code: number): void {
    if (!user.actionCode) {
      throw new ValidationError('No verification code found');
    }

    if (!this.isValidVerificationType(user.actionCode.type)) {
      throw new ValidationError('Invalid verification code type');
    }

    if (user.actionCode.code !== String(code)) {
      throw new ValidationError('Invalid verification code');
    }
  }

  isVerificationCodeExpired(user: ICPUserDocument): boolean {
    if (!user.actionCode?.expires) {
      return true;
    }

    return new Date(user.actionCode.expires) < new Date();
  }

  private buildUserQuery(
    identifier: string,
    clientPortalId: string,
  ): Record<string, any> {
    const identifierType = detectIdentifierType(identifier);
    const query: Record<string, any> = { clientPortalId };

    if (identifierType === 'email') {
      query.email = { $regex: new RegExp(`^${identifier}$`, 'i') };
    } else {
      query.phone = { $regex: new RegExp(`^${identifier}$`, 'i') };
    }

    return query;
  }

  private getOTPConfigForLogin(
    identifierType: 'email' | 'phone',
    clientPortal: IClientPortalDocument,
  ): {
    codeLength: number;
    duration: number;
    emailSubject: string;
    messageTemplate: string;
  } {
    const otpConfig = clientPortal.securityAuthConfig?.otpConfig;
    const defaults = {
      codeLength: VERIFICATION_CODE_CONFIG.DEFAULT_LENGTH,
      duration: VERIFICATION_CODE_CONFIG.DEFAULT_EXPIRATION_SECONDS,
      emailSubject: 'Login OTP',
      messageTemplate: '',
    };

    if (identifierType === 'email') {
      const emailConfig = otpConfig?.email;
      return emailConfig
        ? {
            codeLength: emailConfig.codeLength ?? defaults.codeLength,
            duration: emailConfig.duration ?? defaults.duration,
            emailSubject: emailConfig.emailSubject ?? defaults.emailSubject,
            messageTemplate:
              emailConfig.messageTemplate ?? defaults.messageTemplate,
          }
        : defaults;
    }

    const smsConfig = otpConfig?.sms;
    return smsConfig
      ? {
          codeLength: smsConfig.codeLength ?? defaults.codeLength,
          duration: smsConfig.duration ?? defaults.duration,
          emailSubject: defaults.emailSubject,
          messageTemplate:
            smsConfig.messageTemplate ?? defaults.messageTemplate,
        }
      : defaults;
  }

  private async updateUserWithOTP(
    userId: string,
    code: string,
    codeExpires: Date,
    actionCodeType: 'EMAIL_VERIFICATION' | 'PHONE_VERIFICATION',
    attempts: number,
    models: IModels,
  ): Promise<void> {
    await models.CPUser.updateOne(
      { _id: userId },
      {
        $set: {
          otpResendAttempts: attempts + 1,
          otpResendLastAttempt: new Date(),
          actionCode: {
            code,
            expires: codeExpires,
            type: actionCodeType,
          },
        },
      },
    );
  }

  private async sendOTPNotification(
    subdomain: string,
    user: ICPUserDocument,
    identifierType: 'email' | 'phone',
    code: string,
    emailSubject: string,
    messageTemplate: string,
    clientPortal: IClientPortalDocument,
    models: IModels,
  ): Promise<void> {
    if (identifierType === 'email' && user.email) {
      await notificationService.sendOTPEmail(
        subdomain,
        user,
        code,
        emailSubject,
        messageTemplate,
        models,
      );
    } else if (identifierType === 'phone' && user.phone) {
      await notificationService.sendOTPSMS(
        subdomain,
        user,
        code,
        messageTemplate,
        clientPortal,
        models,
      );
    }
  }

  async sendOTPForLogin(
    subdomain: string,
    identifier: string,
    clientPortal: IClientPortalDocument,
    models: IModels,
  ): Promise<void> {
    const identifierType = detectIdentifierType(identifier);
    const query = this.buildUserQuery(identifier, clientPortal._id);
    const user = await models.CPUser.findOne(query);

    if (!user) {
      return;
    }

    if (!otpService.checkOTPResendLimit(user, clientPortal)) {
      throw new RateLimitError(
        'OTP resend limit exceeded. Please try again later.',
      );
    }

    const otpConfig = this.getOTPConfigForLogin(identifierType, clientPortal);
    const { code, codeExpires } = this.generateVerificationCode(
      otpConfig.codeLength,
      otpConfig.duration,
    );

    const actionCodeType =
      identifierType === 'email' ? 'EMAIL_VERIFICATION' : 'PHONE_VERIFICATION';

    await this.updateUserWithOTP(
      user._id,
      code,
      codeExpires,
      actionCodeType,
      user.otpResendAttempts || 0,
      models,
    );

    await this.sendOTPNotification(
      subdomain,
      user,
      identifierType,
      code,
      otpConfig.emailSubject,
      otpConfig.messageTemplate,
      clientPortal,
      models,
    );
  }
}

export const verificationService = new VerificationService();
