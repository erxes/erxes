import { IModels } from '~/connectionResolvers';
import { ICPUserDocument } from '@/clientportal/types/cpUser';
import {
  AuthenticationError,
  TokenExpiredError,
  ValidationError,
} from '@/clientportal/services/errorHandler';

export type ActionCodeType =
  | 'EMAIL_VERIFICATION'
  | 'PHONE_VERIFICATION'
  | 'PASSWORD_RESET'
  | 'EMAIL_CHANGE'
  | 'PHONE_CHANGE';

export interface ActionCodeData {
  code: string;
  expires: Date;
  type: ActionCodeType;
}

export interface SetActionCodeOptions {
  incrementResendAttempts?: boolean;
  currentAttempts?: number;
}

export async function setActionCode(
  userId: string,
  actionCode: ActionCodeData,
  models: IModels,
  options?: SetActionCodeOptions,
): Promise<void> {
  const update: Record<string, unknown> = {
    actionCode: {
      code: actionCode.code,
      expires: actionCode.expires,
      type: actionCode.type,
    },
  };

  if (
    options?.incrementResendAttempts &&
    options.currentAttempts !== undefined
  ) {
    (update as any).otpResendAttempts = options.currentAttempts + 1;
    (update as any).otpResendLastAttempt = new Date();
  }

  await models.CPUser.updateOne({ _id: userId }, { $set: update as any });
}

export function validateActionCode(
  user: ICPUserDocument | null,
  code: string | number,
  expectedType: ActionCodeType,
): void {
  if (!user || !user.actionCode) {
    throw new AuthenticationError('Invalid or expired token');
  }

  if (user.actionCode.type !== expectedType) {
    throw new ValidationError('Invalid verification code type');
  }

  if (new Date(user.actionCode.expires) < new Date()) {
    throw new TokenExpiredError('Verification code has expired');
  }

  if (user.actionCode.code !== String(code)) {
    throw new ValidationError('Invalid verification code');
  }
}

export function isActionCodeExpired(user: ICPUserDocument): boolean {
  if (!user.actionCode?.expires) {
    return true;
  }
  return new Date(user.actionCode.expires) < new Date();
}
