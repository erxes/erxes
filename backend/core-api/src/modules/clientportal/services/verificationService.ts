import { random } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { IClientPortalDocument } from '@/clientportal/types/clientPortal';
import { ICPUserDocument } from '@/clientportal/types/cpUser';
import { detectIdentifierType } from './helpers/validators';
import { otpService } from './otpService';
import { notificationService } from './notificationService';
import { RateLimitError, ValidationError } from './errorHandler';
import { buildUserQuery } from './helpers/queryBuilders';
import {
  getOTPConfig,
  isPasswordlessLoginEnabled,
} from '@/clientportal/services/helpers/otpConfigHelper';

const VALID_VERIFICATION_TYPES = ['EMAIL_VERIFICATION', 'PHONE_VERIFICATION'];

export class VerificationService {
  generateVerificationCode(
    length: number,
    expirationInMinutes: number,
  ): { code: string; codeExpires: Date } {
    const code = random('0', length);
    const codeExpires = new Date(Date.now() + expirationInMinutes * 60 * 1000);

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

    // Check if passwordless login is enabled for this identifier type
    if (!isPasswordlessLoginEnabled(clientPortal, identifierType)) {
      throw new ValidationError(
        'Passwordless login is not enabled for this identifier type',
      );
    }

    const query = buildUserQuery(
      undefined,
      identifierType === 'email' ? identifier : undefined,
      identifierType === 'phone' ? identifier : undefined,
      clientPortal._id,
    );
    const user = await models.CPUser.findOne(query);

    if (!user) {
      throw new ValidationError('User not found');
    }

    if (!otpService.checkOTPResendLimit(user, clientPortal)) {
      throw new RateLimitError(
        'OTP resend limit exceeded. Please try again later.',
      );
    }

    const otpConfig = getOTPConfig(identifierType, clientPortal, 'login');
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
