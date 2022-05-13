import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  clientPortalSchema,
  clientPortalUserSchema,
  IClientPortal,
  IClientPortalDocument,
  IUser,
  IUserDocument
} from './definitions/clientPortal';
import * as sha256 from 'sha256';

export interface IClientPortalModel extends Model<IClientPortalDocument> {
  getConfig(_id: string): Promise<IClientPortalDocument>;
  createOrUpdateConfig(args: IClientPortal): Promise<IClientPortalDocument>;
}

const SALT_WORK_FACTOR = 10;

interface IEditProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface IUserModel extends Model<IUserDocument> {
  checkPassword(password: string): void;
  getSecret(): string;
  generateToken(): { token: string; expires: Date };
  createUser(doc: IUser): Promise<IUserDocument>;
  editProfile(_id: string, doc: IEditProfile): Promise<IUserDocument>;
  generatePassword(password: string): Promise<string>;
  comparePassword(password: string, userPassword: string): boolean;
  resetPassword({
    token,
    newPassword
  }: {
    token: string;
    newPassword: string;
  }): Promise<IUserDocument>;
  changePassword({
    _id,
    currentPassword,
    newPassword
  }: {
    _id: string;
    currentPassword: string;
    newPassword: string;
  }): Promise<IUserDocument>;
  forgotPassword(email: string): string;
  createTokens(_user: IUserDocument, secret: string): string[];
  refreshTokens(
    refreshToken: string
  ): { token: string; refreshToken: string; user: IUserDocument };
  // login(args: ILoginParams): { token: string; refreshToken: string };
  imposeVerificationCode(phone: string): string;
  changePasswordWithCode({
    phone,
    code,
    password
  }: {
    phone: string;
    code: string;
    password: string;
  }): string;
}

export const loadClientPortalClass = (models: IModels) => {
  class ClientPortal {
    public static async getConfig(_id: string) {
      const config = await models.ClientPortals.findOne({ _id }).lean();

      if (!config) {
        throw new Error('Config not found');
      }

      return config;
    }

    public static async createOrUpdateConfig({ _id, ...doc }: IClientPortal) {
      let config = await models.ClientPortals.findOne({ _id });

      if (!config) {
        config = await models.ClientPortals.create(doc);

        return config.toJSON();
      }

      return models.ClientPortals.findOneAndUpdate(
        { _id: config._id },
        { $set: doc },
        { new: true }
      );
    }
  }

  clientPortalSchema.loadClass(ClientPortal);

  return clientPortalSchema;
};

export const loadClientPortalUserClass = (models: IModels) => {
  class ClientPortalUser {
    public static async getConfig(_id: string) {
      const config = await models.ClientPortals.findOne({ _id }).lean();

      if (!config) {
        throw new Error('Config not found');
      }

      return config;
    }

    public static getSecret() {
      return process.env.JWT_TOKEN_SECRET || '';
    }

    public static generatePassword(password: string) {
      const hashPassword = sha256(password);

      return bcrypt.hash(hashPassword, SALT_WORK_FACTOR);
    }

    public static comparePassword(password: string, userPassword: string) {
      const hashPassword = sha256(password);

      return bcrypt.compare(hashPassword, userPassword);
    }

    public static async generateToken() {
      const buffer = await crypto.randomBytes(20);
      const token = buffer.toString('hex');

      return {
        token,
        expires: Date.now() + 86400000
      };
    }

    public static checkPassword(password: string) {
      if (!password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/)) {
        throw new Error(
          'Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters'
        );
      }
    }
  }

  clientPortalUserSchema.loadClass(ClientPortalUser);

  return clientPortalUserSchema;
};
