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
import {
  isVerificationCodeExpired,
  validateVerificationCode,
} from '@/clientportal/services/verification';
import { sendAndStoreOTP } from '@/clientportal/services/verification/helpers/otpSenderHelper';
import {
  detectIdentifierType,
  identifierTypeToActionCodeType,
  validateUserRegistration,
} from '@/clientportal/services/verification/helpers/validators';
import {
  buildUserQuery,
  buildDuplicationQuery,
} from '@/clientportal/services/helpers/queryBuilders';
import { normalizeEmail } from '@/clientportal/utils';
import {
  updateLastLogin,
  getCPUserByIdOrThrow,
  assertCPUserEmailPhoneUnique,
} from '@/clientportal/services/helpers/userUtils';
import {
  isEmailVerificationEnabled,
  isPhoneVerificationEnabled,
} from '@/clientportal/services/verification/helpers/otpConfigHelper';
import {
  AuthenticationError,
  ValidationError,
  TokenExpiredError,
} from '@/clientportal/services/errorHandler';

interface UserFields {
  email?: string;
  phone?: string;
  userCode?: string;
}

async function checkFieldDuplication(
  field: string,
  value: string,
  baseQuery: Record<string, any>,
  models: IModels,
  errorMessage: string,
): Promise<void> {
  const existingUser = await models.CPUser.findOne({
    [field]: value,
    ...baseQuery,
  });

  if (existingUser) {
    throw new ValidationError(errorMessage);
  }
}

export async function checkDuplication(
  userFields: UserFields,
  models: IModels,
  idsToExclude?: string[] | string,
  clientPortalId?: string,
): Promise<void> {
  if (!userFields) {
    return;
  }

  const baseQuery = buildDuplicationQuery(
    userFields,
    idsToExclude,
    clientPortalId,
  );

  if (userFields.email) {
    await checkFieldDuplication(
      'email',
      userFields.email,
      baseQuery,
      models,
      'Duplicated email',
    );
  }

  if (userFields.phone) {
    await checkFieldDuplication(
      'phone',
      userFields.phone,
      baseQuery,
      models,
      'Duplicated phone',
    );
  }

  if (userFields.userCode) {
    await checkFieldDuplication(
      'userCode',
      userFields.userCode,
      baseQuery,
      models,
      'Duplicated code',
    );
  }
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

function validateUserVerificationStatus(user: ICPUserDocument): void {
  if (!user.isVerified) {
    throw new AuthenticationError('User is not verified');
  }
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

  const document = {
    ...params,
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
      (identifierType === 'phone' &&
        !isPhoneVerificationEnabled(clientPortal));

    if (shouldAutoVerify) {
      await autoVerifyUser(user, models);
      resultUser = user;
    } else {
      const actionCodeType = identifierTypeToActionCodeType(identifierType);

      await sendAndStoreOTP({
        user,
        identifierType,
        actionCodeType,
        context: 'registration',
        clientPortal,
        subdomain,
        models,
      });

      resultUser = user;
    }
  }

  return resultUser;
}

export async function verifyUser(
  userId: string,
  email: string,
  phone: string,
  code: number,
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

  if (isVerificationCodeExpired(user)) {
    throw new TokenExpiredError('Verification code expired');
  }

  validateVerificationCode(user, code);

  return markUserAsVerified(user, models);
}

export async function login(
  email: string,
  phone: string,
  password: string,
  clientPortal: IClientPortalDocument,
  models: IModels,
): Promise<ICPUserDocument> {
  const query = buildUserQuery(undefined, email, phone, clientPortal._id);
  const user = await models.CPUser.findOne(query);

  if (!user || !user.password) {
    throw new AuthenticationError('Invalid login');
  }

  validateUserVerificationStatus(user);

  const isValid = await models.CPUser.comparePassword(
    password,
    user.password,
  );

  if (!isValid) {
    throw new AuthenticationError('Invalid login');
  }

  await updateLastLogin(user._id, models);

  return user;
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


