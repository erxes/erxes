import { IModels } from '~/connectionResolvers';
import { ICPUserDocument } from '@/clientportal/types/cpUser';
import {
  AuthenticationError,
  ValidationError,
} from '@/clientportal/services/errorHandler';
import {
  buildDuplicationQuery,
  UserFields,
} from '@/clientportal/services/helpers/queryBuilders';

export async function updateLastLogin(
  userId: string,
  models: IModels,
): Promise<void> {
  await models.CPUser.updateOne(
    { _id: userId },
    { $set: { lastLoginAt: new Date() } },
  );
}

export async function getCPUserByIdOrThrow(
  userId: string,
  models: IModels,
): Promise<ICPUserDocument> {
  const user = await models.CPUser.findOne({ _id: userId });
  if (!user) {
    throw new ValidationError('User not found');
  }
  return user;
}

export async function assertCPUserEmailPhoneUnique(
  clientPortalId: string,
  fields: UserFields,
  excludeUserId: string | undefined,
  models: IModels,
): Promise<void> {
  if (!fields.email && !fields.phone) {
    return;
  }

  const baseQuery = buildDuplicationQuery(
    fields,
    excludeUserId ? [excludeUserId] : undefined,
    clientPortalId,
  );

  if (fields.email) {
    const existing = await models.CPUser.findOne({
      email: fields.email,
      ...baseQuery,
    });
    if (existing) {
      throw new ValidationError('Email already exists in this client portal');
    }
  }

  if (fields.phone) {
    const existing = await models.CPUser.findOne({
      phone: fields.phone,
      ...baseQuery,
    });
    if (existing) {
      throw new ValidationError('Phone already exists in this client portal');
    }
  }
}

/**
 * Asserts that no other user in the portal has the given email or phone
 * in either their main contact fields or pending contact fields.
 * Use when validating a requested contact change (e.g. new email/phone for OTP flow).
 */
export async function assertContactChangeUnique(
  clientPortalId: string,
  excludeUserId: string,
  fields: { email?: string; phone?: string },
  models: IModels,
): Promise<void> {
  const baseQuery = {
    clientPortalId,
    _id: { $ne: excludeUserId },
  };

  if (fields.email) {
    const existing = await models.CPUser.findOne({
      ...baseQuery,
      email: fields.email,
    });
    if (existing) {
      throw new ValidationError('Email already exists in this client portal');
    }
  }

  if (fields.phone) {
    const existing = await models.CPUser.findOne({
      ...baseQuery,
      phone: fields.phone,
    });
    if (existing) {
      throw new ValidationError('Phone already exists in this client portal');
    }
  }
}
