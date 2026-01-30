import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import sha256 from 'sha256';
import { IModels } from '~/connectionResolvers';
import { cpUserSchema, EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import {
  ICPUserDocument,
  ICPUserRegisterParams,
} from '@/clientportal/types/cpUser';
import { SALT_WORK_FACTOR } from '../../constants';
import { cpUserService } from '@/clientportal/services/cpUserService';
import {
  generateCPUserCreatedActivityLog,
  generateCPUserActivityLogs,
  generateCPUserRemovedActivityLog,
} from '@/clientportal/utils/activityLogs';

export interface ICPUserModel extends Model<ICPUserDocument> {
  generatePassword(password: string): Promise<string>;
  comparePassword(password: string, userPassword: string): Promise<boolean>;
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

    public static async createUserAsAdmin(
      clientPortalId: string,
      params: ICPUserRegisterParams,
      models: IModels,
    ): Promise<ICPUserDocument> {
      const user = await cpUserService.createUserAsAdmin(
        clientPortalId,
        params,
        models,
      );
      try {
        createActivityLog(generateCPUserCreatedActivityLog(user));
      } catch {
        // Activity log failure should not fail the mutation
      }
      return user;
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
      const updatedUser = await cpUserService.updateUser(userId, params, models);
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
      const user = await models.CPUser.findOne({ _id: userId });
      await cpUserService.removeUser(userId, models);
      if (user) {
        try {
          createActivityLog(generateCPUserRemovedActivityLog(user));
        } catch {
          // Activity log failure should not fail the mutation
        }
      }
    }
  }

  cpUserSchema.loadClass(CPUser);

  return cpUserSchema;
};
