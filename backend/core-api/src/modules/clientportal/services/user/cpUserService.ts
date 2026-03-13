import { IModels } from '~/connectionResolvers';
import { IClientPortalDocument } from '@/clientportal/types/clientPortal';
import {
  ICPUserDocument,
  ICPUserRegisterParams,
} from '@/clientportal/types/cpUser';
import {
  handleCPContacts,
  updateCustomerStateToCustomer,
} from './contactService';

import { sendAndStoreOTP } from '@/clientportal/services/helpers/otpSenderHelper';
import {
  detectIdentifierType,
  identifierTypeToActionCodeType,
  validateUserRegistration,
} from '@/clientportal/services/helpers/validators';
import {
  buildUserQuery,
  buildDuplicationQuery,
} from '@/clientportal/services/helpers/queryBuilders';
import { normalizeEmail } from '@/clientportal/utils';
import {
  getCPUserByIdOrThrow,
  assertCPUserEmailPhoneUnique,
} from '@/clientportal/services/helpers/userUtils';
import {
  isEmailVerificationEnabled,
  isPhoneVerificationEnabled,
} from '@/clientportal/services/helpers/otpConfigHelper';
import {
  AuthenticationError,
  ValidationError,
  TokenExpiredError,
} from '@/clientportal/services/errorHandler';
import {
  ActionCodeType,
  isActionCodeExpired,
  validateActionCode,
} from '../helpers/actionCodeHelper';

interface UserFields {
  email?: string;
  phone?: string;
  userCode?: string;
}

async function autoVerifyUser(
  user: ICPUserDocument,
  models: IModels,
): Promise<void> {
  await models.CPUser.updateOne(
    { _id: user._id },
    {
      $set: {
        isVerified: true,
        isEmailVerified: !!user.email,
        isPhoneVerified: !!user.phone,
      },
    },
  );

  if (user.erxesCustomerId) {
    await updateCustomerStateToCustomer(user.erxesCustomerId, models);
  }
}

async function markUserAsVerified(
  user: ICPUserDocument,
  models: IModels,
): Promise<ICPUserDocument> {
  const updateData: any = { isVerified: true };

  if (user.actionCode?.type === 'EMAIL_VERIFICATION') {
    updateData.isEmailVerified = true;
  } else if (user.actionCode?.type === 'PHONE_VERIFICATION') {
    updateData.isPhoneVerified = true;
  }

  await models.CPUser.updateOne(
    { _id: user._id },
    {
      $set: updateData,
      $unset: { actionCode: '' },
    },
  );

  if (user.erxesCustomerId) {
    await updateCustomerStateToCustomer(user.erxesCustomerId, models);
  }

  const updatedUser = await models.CPUser.findOne({ _id: user._id });
  return updatedUser || user;
}

export async function registerUser(
  subdomain: string,
  clientPortal: IClientPortalDocument,
  params: ICPUserRegisterParams,
  models: IModels,
): Promise<ICPUserDocument> {
  if (params.password) {
    validateUserRegistration(params);
  }

  const { ...documentParams } = params;
  const document = {
    ...documentParams,
    isEmailVerified: false,
    isPhoneVerified: false,
  };

  const user = await handleCPContacts(
    models,
    clientPortal._id,
    document,
    params.password,
  );

  const identifier = user.email || user.phone;
  let resultUser = user;

  if (identifier) {
    const identifierType = detectIdentifierType(identifier);

    const shouldAutoVerify =
      (identifierType === 'email' &&
        !isEmailVerificationEnabled(clientPortal)) ||
      (identifierType === 'phone' && !isPhoneVerificationEnabled(clientPortal));

    if (shouldAutoVerify) {
      await autoVerifyUser(user, models);
      resultUser = user;
    }
  }

  return (await models.CPUser.findOne({ _id: resultUser._id })) || resultUser;
}

export async function verifyUser(
  userId: string,
  email: string,
  phone: string,
  code: string,
  clientPortal: IClientPortalDocument,
  models: IModels,
): Promise<ICPUserDocument> {
  const query = buildUserQuery(userId, email, phone, clientPortal._id);
  const user = await models.CPUser.findOne(query);

  if (!user) {
    throw new AuthenticationError('User not found');
  }

  if (user.isVerified) {
    throw new ValidationError('User already verified');
  }

  if (isActionCodeExpired(user)) {
    throw new TokenExpiredError('Verification code expired');
  }

  if (!user.actionCode) {
    throw new ValidationError('No verification code found');
  }

  const VALID_VERIFICATION_TYPES: ActionCodeType[] = [
    'EMAIL_VERIFICATION',
    'PHONE_VERIFICATION',
  ];

  function isValidVerificationType(type: string): type is ActionCodeType {
    return VALID_VERIFICATION_TYPES.includes(type as ActionCodeType);
  }

  if (!isValidVerificationType(user.actionCode.type)) {
    throw new ValidationError('Invalid verification code type');
  }
  validateActionCode(user, code, user.actionCode.type as ActionCodeType);

  return markUserAsVerified(user, models);
}

export async function updateUser(
  userId: string,
  params: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    username?: string;
    companyName?: string;
    companyRegistrationNumber?: string;
    erxesCustomerId?: string;
  },
  models: IModels,
): Promise<ICPUserDocument> {
  const user = await getCPUserByIdOrThrow(userId, models);

  const normalizedEmail =
    params.email !== undefined ? normalizeEmail(params.email) : undefined;
  const trimmedPhone =
    params.phone !== undefined ? (params.phone || '').trim() : undefined;

  const userFields: UserFields = {};
  if (normalizedEmail) userFields.email = normalizedEmail;
  if (trimmedPhone) userFields.phone = trimmedPhone;
  if (Object.keys(userFields).length > 0) {
    await assertCPUserEmailPhoneUnique(
      user.clientPortalId,
      userFields,
      userId,
      models,
    );
  }

  const updateData: Record<string, unknown> = { ...params };
  if (params.email !== undefined) {
    updateData.email = normalizedEmail || undefined;
  }
  if (params.phone !== undefined) {
    updateData.phone = trimmedPhone || undefined;
  }

  const setData = Object.fromEntries(
    Object.entries(updateData).filter(([_, value]) => value !== undefined),
  );
  const unsetData: Record<string, string> = {};
  if (params.email !== undefined && !normalizeEmail(params.email)) {
    unsetData.email = '';
  }
  if (params.phone !== undefined && !(params.phone || '').trim()) {
    unsetData.phone = '';
  }

  if (params.erxesCustomerId !== undefined) {
    const trimmedCustomerId = params.erxesCustomerId.trim();
    if (trimmedCustomerId) {
      setData.erxesCustomerId = trimmedCustomerId;
      await updateCustomerStateToCustomer(trimmedCustomerId, models);
    } else {
      unsetData.erxesCustomerId = '';
    }
  }

  if (
    Object.keys(setData).length === 0 &&
    Object.keys(unsetData).length === 0
  ) {
    return user;
  }

  const update: Record<string, unknown> = {};
  if (Object.keys(setData).length > 0) update.$set = setData;
  if (Object.keys(unsetData).length > 0) update.$unset = unsetData;
  await models.CPUser.updateOne({ _id: userId }, update);

  return getCPUserByIdOrThrow(userId, models);
}
