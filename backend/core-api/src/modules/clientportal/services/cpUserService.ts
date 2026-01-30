import { IModels } from '~/connectionResolvers';
import { IClientPortalDocument } from '@/clientportal/types/clientPortal';
import {
  ICPUserDocument,
  ICPUserRegisterParams,
} from '@/clientportal/types/cpUser';
import { contactService } from './contactService';
import { verificationService } from './verificationService';
import { notificationService } from './notificationService';
import {
  detectIdentifierType,
  validateUserRegistration,
} from './helpers/validators';
import { buildUserQuery, buildDuplicationQuery } from './helpers/queryBuilders';
import { normalizeEmail } from '@/clientportal/utils';
import {
  updateLastLogin,
  getCPUserByIdOrThrow,
  setUserActionCode,
  assertCPUserEmailPhoneUnique,
} from '@/clientportal/services/helpers/userUtils';
import {
  getOTPConfig,
  isEmailVerificationEnabled,
  isPhoneVerificationEnabled,
} from '@/clientportal/services/helpers/otpConfigHelper';
import {
  AuthenticationError,
  ValidationError,
  TokenExpiredError,
} from './errorHandler';

interface UserFields {
  email?: string;
  phone?: string;
  userCode?: string;
}

export class CPUserService {
  private async checkFieldDuplication(
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

  async checkDuplication(
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
      await this.checkFieldDuplication(
        'email',
        userFields.email,
        baseQuery,
        models,
        'Duplicated email',
      );
    }

    if (userFields.phone) {
      await this.checkFieldDuplication(
        'phone',
        userFields.phone,
        baseQuery,
        models,
        'Duplicated phone',
      );
    }

    if (userFields.userCode) {
      await this.checkFieldDuplication(
        'userCode',
        userFields.userCode,
        baseQuery,
        models,
        'Duplicated code',
      );
    }
  }

  private async autoVerifyUser(
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

    // Update customer state to 'customer' when user is verified
    if (user.erxesCustomerId) {
      await contactService.updateCustomerStateToCustomer(
        user.erxesCustomerId,
        models,
      );
    }
  }

  private async sendVerificationOTP(
    subdomain: string,
    user: ICPUserDocument,
    identifierType: 'email' | 'phone',
    code: string,
    emailSubject: string,
    messageTemplate: string,
    clientPortal: IClientPortalDocument,
    models: IModels,
  ): Promise<void> {
    await notificationService.sendOTP(
      subdomain,
      user,
      identifierType,
      code,
      { emailSubject, messageTemplate },
      clientPortal,
      models,
    );
  }

  async registerUser(
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

    const user = await contactService.handleCPContacts(
      models,
      clientPortal._id,
      document,
      params.password,
    );

    const identifier = user.email || user.phone;
    let resultUser = user;

    if (identifier) {
      const identifierType = detectIdentifierType(identifier);

      // Check if verification is enabled for the identifier type
      const shouldAutoVerify =
        (identifierType === 'email' &&
          !isEmailVerificationEnabled(clientPortal)) ||
        (identifierType === 'phone' &&
          !isPhoneVerificationEnabled(clientPortal));

      if (shouldAutoVerify) {
        // Verification is disabled, auto-verify the user
        await this.autoVerifyUser(user, models);
        resultUser = user;
      } else {
        const otpConfig = getOTPConfig(
          identifierType,
          clientPortal,
          'registration',
        );

        const { code, codeExpires } =
          verificationService.generateVerificationCode(
            otpConfig.codeLength,
            otpConfig.duration,
          );

        const actionCodeType =
          identifierType === 'email'
            ? 'EMAIL_VERIFICATION'
            : 'PHONE_VERIFICATION';

        await setUserActionCode(
          user._id,
          { code, expires: codeExpires, type: actionCodeType },
          models,
        );

        await this.sendVerificationOTP(
          subdomain,
          user,
          identifierType,
          code,
          otpConfig.emailSubject,
          otpConfig.messageTemplate,
          clientPortal,
          models,
        );

        resultUser = user;
      }
    }

    return resultUser;
  }

  private async markUserAsVerified(
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

    // Update customer state to 'customer' when user is verified
    if (user.erxesCustomerId) {
      await contactService.updateCustomerStateToCustomer(
        user.erxesCustomerId,
        models,
      );
    }

    const updatedUser = await models.CPUser.findOne({ _id: user._id });
    return updatedUser || user;
  }

  async verifyUser(
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

    if (verificationService.isVerificationCodeExpired(user)) {
      throw new TokenExpiredError('Verification code expired');
    }

    verificationService.validateVerificationCode(user, code);

    return this.markUserAsVerified(user, models);
  }

  private validateUserVerificationStatus(user: ICPUserDocument): void {
    if (!user.isVerified) {
      throw new AuthenticationError('User is not verified');
    }
  }

  async login(
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

    this.validateUserVerificationStatus(user);

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

  async updateUser(
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

  async addFcmToken(
    cpUserId: string,
    fcmToken: string,
    models: IModels,
  ): Promise<ICPUserDocument> {
    const trimmed = (fcmToken || '').trim();
    if (!trimmed) {
      throw new ValidationError('FCM token is required');
    }

    await models.CPUser.updateOne(
      { _id: cpUserId },
      { $addToSet: { fcmTokens: trimmed } },
    );

    return getCPUserByIdOrThrow(cpUserId, models);
  }

  async removeFcmToken(
    cpUserId: string,
    fcmToken: string,
    models: IModels,
  ): Promise<ICPUserDocument> {
    await models.CPUser.updateOne(
      { _id: cpUserId },
      { $pull: { fcmTokens: (fcmToken || '').trim() } },
    );

    return getCPUserByIdOrThrow(cpUserId, models);
  }

  async createUserAsAdmin(
    clientPortalId: string,
    params: ICPUserRegisterParams,
    models: IModels,
  ): Promise<ICPUserDocument> {
    if (!params.email && !params.phone) {
      throw new ValidationError('Email or phone is required');
    }

    const clientPortal = await models.ClientPortal.findOne({
      _id: clientPortalId,
    });
    if (!clientPortal) {
      throw new ValidationError('Client portal not found');
    }

    const document = {
      ...params,
      isEmailVerified: false,
      isPhoneVerified: false,
    };

    const user = await contactService.handleCPContacts(
      models,
      clientPortalId,
      document,
      params.password,
    );

    await this.autoVerifyUser(user, models);
    return getCPUserByIdOrThrow(user._id, models);
  }

  async removeUser(userId: string, models: IModels): Promise<void> {
    await getCPUserByIdOrThrow(userId, models);
    await models.CPUser.findOneAndDelete({ _id: userId });
  }
}

export const cpUserService = new CPUserService();
