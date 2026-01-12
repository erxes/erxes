import { IModels } from '~/connectionResolvers';
import { IClientPortalDocument } from '@/clientportal/types/clientPortal';
import {
  ICPUserDocument,
  ICPUserRegisterParams,
} from '@/clientportal/types/cpUser';
import { contactService } from './contactService';
import { verificationService } from './verificationService';
import { notificationService } from './notificationService';
import { validateUserRegistration } from './helpers/validators';
import { buildUserQuery, buildDuplicationQuery } from './helpers/queryBuilders';
import { detectIdentifierType } from './helpers/validators';
import { updateLastLogin } from '@/clientportal/services/helpers/userUtils';
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
  ): Promise<void> {
    if (!userFields) {
      return;
    }

    const baseQuery = buildDuplicationQuery(userFields, idsToExclude);

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

        await models.CPUser.updateOne(
          { _id: user._id },
          {
            $set: {
              actionCode: {
                code,
                expires: codeExpires,
                type: actionCodeType,
              },
            },
          },
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
      firstName?: string;
      lastName?: string;
      avatar?: string;
      username?: string;
      companyName?: string;
      companyRegistrationNumber?: string;
    },
    models: IModels,
  ): Promise<ICPUserDocument> {
    const updateData = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined),
    );

    if (Object.keys(updateData).length === 0) {
      const user = await models.CPUser.findOne({ _id: userId });
      if (!user) {
        throw new AuthenticationError('User not found');
      }
      return user;
    }

    await models.CPUser.updateOne({ _id: userId }, { $set: updateData });

    const updatedUser = await models.CPUser.findOne({ _id: userId });
    if (!updatedUser) {
      throw new AuthenticationError('User not found');
    }

    return updatedUser;
  }
}

export const cpUserService = new CPUserService();
