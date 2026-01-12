import * as crypto from 'crypto';
import { IModels } from '~/connectionResolvers';
import { IClientPortalDocument } from '@/clientportal/types/clientPortal';
import { ICPUserDocument } from '@/clientportal/types/cpUser';
import { detectIdentifierType } from './helpers/validators';
import { validatePassword } from './helpers/validators';
import { verificationService } from './verificationService';
import { notificationService } from './notificationService';
import { getOTPConfig } from '@/clientportal/services/helpers/otpConfigHelper';
import {
  AuthenticationError,
  ValidationError,
  TokenExpiredError,
} from './errorHandler';
import { buildUserQuery } from './helpers/queryBuilders';

const RESET_TOKEN_EXPIRY_HOURS = 1;

export class PasswordService {
  private async setPasswordResetCode(
    userId: string,
    code: string,
    expires: Date,
    models: IModels,
  ): Promise<void> {
    await models.CPUser.updateOne(
      { _id: userId },
      {
        $set: {
          actionCode: {
            code,
            expires,
            type: 'PASSWORD_RESET',
          },
        },
      },
    );
  }

  private async sendPasswordResetOTP(
    subdomain: string,
    user: ICPUserDocument,
    identifierType: 'email' | 'phone',
    code: string,
    resetPasswordConfig: any,
    clientPortal: IClientPortalDocument,
    models: IModels,
  ): Promise<void> {
    const emailSubject = resetPasswordConfig?.emailSubject || 'Password Reset';
    const emailContent = resetPasswordConfig?.emailContent || '';

    if (identifierType === 'email') {
      await notificationService.sendOTPEmail(
        subdomain,
        user,
        code,
        emailSubject,
        emailContent,
        models,
      );
    } else {
      await notificationService.sendOTPSMS(
        subdomain,
        user,
        code,
        emailContent,
        clientPortal,
        models,
      );
    }
  }

  private async sendPasswordResetLink(
    subdomain: string,
    user: ICPUserDocument,
    resetToken: string,
    clientPortal: IClientPortalDocument,
    resetPasswordConfig: any,
    models: IModels,
  ): Promise<void> {
    if (!user.email) {
      return;
    }

    const resetUrl = `${
      clientPortal.url || ''
    }/reset-password?token=${resetToken}`;
    const emailSubject = resetPasswordConfig?.emailSubject || 'Password Reset';
    const emailContent = resetPasswordConfig?.emailContent || '';

    await notificationService.sendEmail(
      subdomain,
      {
        toEmails: [user.email],
        title: emailSubject,
        customHtml: emailContent,
        customHtmlData: { resetUrl, token: resetToken },
        userId: user._id,
      },
      models,
    );
  }

  async forgotPassword(
    identifier: string,
    clientPortal: IClientPortalDocument,
    models: IModels,
    subdomain: string,
  ): Promise<void> {
    const identifierType = detectIdentifierType(identifier);
    const query = buildUserQuery(
      undefined,
      identifierType === 'email' ? identifier : undefined,
      identifierType === 'phone' ? identifier : undefined,
      clientPortal._id,
    );
    const user = await models.CPUser.findOne(query);

    if (!user) {
      return;
    }

    const resetPasswordConfig =
      clientPortal.securityAuthConfig?.resetPasswordConfig;
    const mode = resetPasswordConfig?.mode || 'link';

    if (mode === 'code') {
      const otpConfig = getOTPConfig(
        identifierType,
        clientPortal,
        'passwordReset',
      );
      const { code, codeExpires } =
        verificationService.generateVerificationCode(
          otpConfig.codeLength,
          otpConfig.duration,
        );

      await this.setPasswordResetCode(user._id, code, codeExpires, models);
      await this.sendPasswordResetOTP(
        subdomain,
        user,
        identifierType,
        code,
        resetPasswordConfig,
        clientPortal,
        models,
      );
    } else {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date();
      resetExpires.setHours(resetExpires.getHours() + RESET_TOKEN_EXPIRY_HOURS);

      await this.setPasswordResetCode(
        user._id,
        resetToken,
        resetExpires,
        models,
      );
      await this.sendPasswordResetLink(
        subdomain,
        user,
        resetToken,
        clientPortal,
        resetPasswordConfig,
        models,
      );
    }
  }

  private validateResetToken(user: ICPUserDocument | null, otp?: number): void {
    if (!user || !user.actionCode) {
      throw new AuthenticationError('Invalid or expired reset token');
    }

    if (user.actionCode.type !== 'PASSWORD_RESET') {
      throw new AuthenticationError('Invalid reset token type');
    }

    if (new Date(user.actionCode.expires) < new Date()) {
      throw new TokenExpiredError('Reset token has expired');
    }

    if (otp !== undefined && user.actionCode.code !== String(otp)) {
      throw new ValidationError('Invalid OTP');
    }
  }

  private async updateUserPassword(
    userId: string,
    hashedPassword: string,
    models: IModels,
  ): Promise<void> {
    await models.CPUser.updateOne(
      { _id: userId },
      {
        $set: { password: hashedPassword },
        $unset: { actionCode: '' },
      },
    );
  }

  async resetPassword(
    token: string,
    newPassword: string,
    otp: number | undefined,
    models: IModels,
  ): Promise<ICPUserDocument> {
    const user = await models.CPUser.findOne({ 'actionCode.code': token });

    this.validateResetToken(user, otp);
    validatePassword(newPassword);

    const hashedPassword = await models.CPUser.generatePassword(newPassword);
    await this.updateUserPassword(user!._id, hashedPassword, models);

    return user!;
  }
}

export const passwordService = new PasswordService();
