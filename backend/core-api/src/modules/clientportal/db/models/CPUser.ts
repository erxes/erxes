import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import sha256 from 'sha256';
import { IModels } from '~/connectionResolvers';
import {
  cpUserSchema,
  EventDispatcherReturn,
} from 'erxes-api-shared/core-modules';
import {
  ICPUserDocument,
  ICPUserRegisterParams,
} from '@/clientportal/types/cpUser';
import { SALT_WORK_FACTOR } from '../../constants';
import { buildUserQuery } from '@/clientportal/services/helpers/queryBuilders';
import {
  handleCPContacts,
  updateCustomerStateToCustomer,
} from '@/clientportal/services/user/contactService';
import { getCPUserByIdOrThrow } from '@/clientportal/services/helpers/userUtils';
import { ValidationError } from '@/clientportal/services/errorHandler';
import { cpUserService } from '@/clientportal/services';
import {
  generateCPUserCreatedActivityLog,
  generateCPUserActivityLogs,
  generateCPUserRemovedActivityLog,
} from '@/clientportal/utils/activityLogs';

export interface ICPUserModel extends Model<ICPUserDocument> {
  generatePassword(password: string): Promise<string>;
  comparePassword(password: string, userPassword: string): Promise<boolean>;
  findByIdentifier(
    identifier: string,
    identifierType: 'email' | 'phone',
    clientPortalId: string,
  ): Promise<ICPUserDocument | null>;
  createUserAsAdmin(
    clientPortalId: string,
    params: ICPUserRegisterParams,
    models: IModels,
  ): Promise<ICPUserDocument>;
  updateUser(
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
  ): Promise<ICPUserDocument>;
  removeUser(userId: string, models: IModels): Promise<void>;
}

export const loadCPUserClass = (
  models: IModels,
  _subdomain: string,
  { createActivityLog }: EventDispatcherReturn,
) => {
  class CPUser {
    public static async comparePassword(
      password: string,
      userPassword: string,
    ): Promise<boolean> {
      const hashPassword = sha256(password);
      return bcrypt.compare(hashPassword, userPassword);
    }

    public static async generatePassword(password: string): Promise<string> {
      const hashPassword = sha256(password);
      return bcrypt.hash(hashPassword, SALT_WORK_FACTOR);
    }

    public static async findByIdentifier(
      identifier: string,
      identifierType: 'email' | 'phone',
      clientPortalId: string,
    ): Promise<ICPUserDocument | null> {
      const query = buildUserQuery(
        undefined,
        identifierType === 'email' ? identifier : undefined,
        identifierType === 'phone' ? identifier : undefined,
        clientPortalId,
      );
      return (this as unknown as Model<ICPUserDocument>).findOne(query);
    }

    public static async createUserAsAdmin(
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

      const user = await handleCPContacts(
        models,
        clientPortalId,
        document,
        params.password,
      );

      await CPUser.autoVerifyUserForAdmin(user, models);

      const resultUser = await getCPUserByIdOrThrow(user._id, models);

      if (resultUser.erxesCustomerId) {
        await updateCustomerStateToCustomer(resultUser.erxesCustomerId, models);
      }

      try {
        createActivityLog(generateCPUserCreatedActivityLog(resultUser));
      } catch {
        // Activity log failure should not fail the mutation
      }
      return resultUser;
    }

    private static async autoVerifyUserForAdmin(
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

    public static async updateUser(
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
      const prevUser = await models.CPUser.findOne({ _id: userId }).lean();
      const updatedUser = await cpUserService.updateUser(
        userId,
        params,
        models,
      );
      try {
        await generateCPUserActivityLogs(
          prevUser || updatedUser,
          updatedUser,
          models,
          createActivityLog,
        );
      } catch {
        // Activity log failure should not fail the mutation
      }
      return updatedUser;
    }

    public static async removeUser(
      userId: string,
      models: IModels,
    ): Promise<void> {
      const user = await getCPUserByIdOrThrow(userId, models);
      await models.CPUser.findOneAndDelete({ _id: userId });
      try {
        createActivityLog(generateCPUserRemovedActivityLog(user));
      } catch {
        // Activity log failure should not fail the mutation
      }
    }
  }

  cpUserSchema.loadClass(CPUser);

  return cpUserSchema;
};
