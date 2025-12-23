import { IModels } from '~/connectionResolvers';
import { IClientPortalDocument } from '@/clientportal/types/clientPortal';
import { ICPUserDocument } from '@/clientportal/types/cpUser';
import { detectIdentifierType } from './helpers/validators';
import {
  AuthenticationError,
  ValidationError,
  TokenExpiredError,
} from './errorHandler';

const DEFAULT_OTP_RESEND_CONFIG = {
  maxAttempts: 3,
  cooldownPeriodInSeconds: 60, // 1 minutes
  maxAttemptsPerHour: 5,
};

const ONE_HOUR_MS = 60 * 60 * 1000;

export class OTPService {
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

  private validateActionCode(
    user: ICPUserDocument,
    otp: number,
    identifierType: 'email' | 'phone',
  ): void {
    if (!user.actionCode) {
      throw new ValidationError('No verification code found');
    }

    const expectedType =
      identifierType === 'email' ? 'EMAIL_VERIFICATION' : 'PHONE_VERIFICATION';

    if (user.actionCode.type !== expectedType) {
      throw new ValidationError('Verification code type mismatch');
    }

    if (user.actionCode.code !== String(otp)) {
      throw new AuthenticationError('Invalid OTP');
    }

    if (new Date(user.actionCode.expires) < new Date()) {
      throw new TokenExpiredError('OTP has expired');
    }
  }

  private async updateLastLogin(
    userId: string,
    models: IModels,
  ): Promise<void> {
    await models.CPUser.updateOne(
      { _id: userId },
      { $set: { lastLoginAt: new Date() } },
    );
  }

  async loginWithOTP(
    identifier: string,
    otp: number,
    clientPortal: IClientPortalDocument,
    models: IModels,
  ): Promise<ICPUserDocument> {
    const identifierType = detectIdentifierType(identifier);
    const query = this.buildUserQuery(identifier, clientPortal._id);
    const user = await models.CPUser.findOne(query);

    if (!user) {
      throw new AuthenticationError('Invalid login');
    }

    this.validateActionCode(user, otp, identifierType);
    await this.updateLastLogin(user._id, models);

    return user;
  }

  private getOTPResendConfig(clientPortal: IClientPortalDocument): {
    maxAttempts: number;
    cooldownPeriodInSeconds: number;
    maxAttemptsPerHour: number;
  } {
    const config = clientPortal.securityAuthConfig?.otpResendConfig;
    return {
      maxAttempts: config?.maxAttempts ?? DEFAULT_OTP_RESEND_CONFIG.maxAttempts,
      cooldownPeriodInSeconds:
        config?.cooldownPeriodInSeconds ??
        DEFAULT_OTP_RESEND_CONFIG.cooldownPeriodInSeconds,
      maxAttemptsPerHour:
        config?.maxAttemptsPerHour ??
        DEFAULT_OTP_RESEND_CONFIG.maxAttemptsPerHour,
    };
  }

  private isWithinCooldown(
    lastAttempt: Date | null,
    cooldownPeriodInSeconds: number,
  ): boolean {
    if (!lastAttempt) {
      return false;
    }

    const cooldownMs = cooldownPeriodInSeconds * 1000;
    const timeSinceLastAttempt = Date.now() - lastAttempt.getTime();

    return timeSinceLastAttempt < cooldownMs;
  }

  private isExceedingHourlyLimit(
    lastAttempt: Date | null,
    attempts: number,
    maxAttemptsPerHour: number,
  ): boolean {
    if (!lastAttempt) {
      return false;
    }

    const oneHourAgo = new Date(Date.now() - ONE_HOUR_MS);
    const isWithinLastHour = lastAttempt > oneHourAgo;

    return isWithinLastHour && attempts >= maxAttemptsPerHour;
  }

  checkOTPResendLimit(
    user: ICPUserDocument,
    clientPortal: IClientPortalDocument,
  ): boolean {
    const config = this.getOTPResendConfig(clientPortal);
    console.log('config', config);
    const lastAttempt = user.otpResendLastAttempt
      ? new Date(user.otpResendLastAttempt)
      : null;
    const attempts = user.otpResendAttempts || 0;
    console.log('lastAttempt', lastAttempt);
    console.log('attempts', attempts);
    if (this.isWithinCooldown(lastAttempt, config.cooldownPeriodInSeconds)) {
      console.log('within cooldown');
      return false;
    }

    if (
      this.isExceedingHourlyLimit(
        lastAttempt,
        attempts,
        config.maxAttemptsPerHour,
      )
    ) {
      return false;
    }

    // if (attempts >= config.maxAttempts) {
    //   return false;
    // }

    return true;
  }
}

export const otpService = new OTPService();
