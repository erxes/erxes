import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import * as randomize from 'randomatic';
import * as sha256 from 'sha256';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  clientPortalUserSchema,
  IUser,
  IUserDocument
} from './definitions/clientPortalUser';
import { sendContactsMessage, sendCoreMessage } from '../messageBroker';
import { sendSms } from '../utils';
import { createJwtToken } from '../auth/authUtils';
import { IOTPConfig } from './definitions/clientPortal';
import { IVerificationParams } from '../graphql/resolvers/mutations/clientPortalUser';

const SALT_WORK_FACTOR = 10;

export interface ILoginParams {
  clientPortalId: string;
  login: string;
  password: string;
  deviceToken?: string;
}

export interface IUserModel extends Model<IUserDocument> {
  getUser(doc: any): Promise<IUserDocument>;
  createUser(subdomain: string, doc: IUser): Promise<IUserDocument>;
  checkPassword(password: string): void;
  getSecret(): string;
  generateToken(): { token: string; expires: Date };
  generatePassword(password: string): Promise<string>;
  comparePassword(password: string, userPassword: string): boolean;
  clientPortalResetPassword({
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
  forgotPassword(clientPortalId: string, phone: string, email: string): any;
  createTokens(_user: IUserDocument, secret: string): string[];
  refreshTokens(
    refreshToken: string
  ): { token: string; refreshToken: string; user: IUserDocument };
  login(args: ILoginParams): { token: string; refreshToken: string };
  imposeVerificationCode({
    phone,
    email,
    isRessetting
  }: {
    phone?: string;
    email?: string;
    isRessetting?: boolean;
  }): string;
  changePasswordWithCode({
    phone,
    code,
    password
  }: {
    phone: string;
    code: string;
    password: string;
  }): string;
  verifyUser(args: IVerificationParams): string;
  sendVerification(
    subdomain: string,
    config?: IOTPConfig,
    phone?: string,
    email?: string
  ): string;
}

export const loadClientPortalUserClass = (models: IModels) => {
  class ClientPortalUser {
    public static async createUser(
      subdomain: string,
      { password, email, phone, clientPortalId, ...doc }: IUser
    ) {
      if (password) this.checkPassword(password);

      const document: any = doc;

      const tEmail = (email || '').toLowerCase().trim();

      let qry: any;

      if (tEmail) {
        document.email = tEmail;
        qry = { email: tEmail };
      }

      if (phone) {
        document.phone = phone;
        qry = { phone };
      }

      const customer = await sendContactsMessage({
        subdomain,
        action: 'customers.findOne',
        data: { customerPrimaryEmail: tEmail, customerPrimaryPhone: phone },
        isRPC: true
      });

      let user = await models.ClientPortalUsers.findOne(qry);

      if (user && (user.isEmailVerified || user.isPhoneVerified)) {
        throw new Error('user is already exists');
      }

      if (user) {
        return user;
      }

      user = await models.ClientPortalUsers.create({
        ...document,
        clientPortalId,
        // hash password
        password: password && (await this.generatePassword(password))
      });

      if (!customer) {
        await sendContactsMessage({
          subdomain,
          action: 'customers.createCustomer',
          data: {
            firstName: doc.firstName,
            lastName: doc.lastName,
            primaryEmail: email,
            primaryPhone: phone,
            state: 'customer'
          },
          isRPC: true
        });
      }

      if (customer && customer._id) {
        await models.ClientPortalUsers.updateOne(
          { _id: user._id },
          { $set: { erxesCustomerId: customer._id } }
        );
      }

      return user;
    }

    public static async getUser(doc: any) {
      const user = await models.ClientPortalUsers.findOne(doc);

      if (!user) {
        throw new Error('user not found');
      }

      return user;
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

    public static async sendVerification(
      subdomain: string,
      config: IOTPConfig,
      phone?: string,
      email?: string
    ) {
      if (phone) {
        const phoneCode = await this.imposeVerificationCode({ phone });

        const body =
          config.content.replace(/{.*}/, phoneCode) ||
          `Your verification code is ${phoneCode}`;

        await sendSms(subdomain, config.smsTransporterType, phone, body);
      }

      if (email) {
        const emailCode = await this.imposeVerificationCode({
          email: (email || '').toLowerCase().trim()
        });

        const content =
          config.content.replace(/{.*}/, emailCode) ||
          `Your verification code is ${emailCode}`;

        await sendCoreMessage({
          subdomain,
          action: 'sendEmail',
          data: {
            toEmails: [email],
            title: 'One Time Password',
            template: {
              name: 'base',
              data: {
                content
              }
            }
          }
        });
      }

      return 'sent';
    }

    public static async clientPortalResetPassword({
      token,
      newPassword
    }: {
      token: string;
      newPassword: string;
    }) {
      const user = await models.ClientPortalUsers.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: {
          $gt: Date.now()
        }
      });

      if (!user) {
        throw new Error('Password reset token is invalid or has expired.');
      }

      if (!newPassword) {
        throw new Error('Password is required.');
      }

      this.checkPassword(newPassword);

      // set new password
      await models.ClientPortalUsers.findByIdAndUpdate(
        { _id: user._id },
        {
          password: await this.generatePassword(newPassword),
          resetPasswordToken: undefined,
          resetPasswordExpires: undefined
        }
      );

      return models.ClientPortalUsers.findOne({ _id: user._id });
    }

    public static async changePassword({
      _id,
      currentPassword,
      newPassword
    }: {
      _id: string;
      currentPassword: string;
      newPassword: string;
    }) {
      // Password can not be empty string
      if (newPassword === '') {
        throw new Error('Password can not be empty');
      }

      this.checkPassword(newPassword);

      const user = await models.ClientPortalUsers.findOne({ _id }).lean();

      if (!user) {
        throw new Error('User not found');
      }

      // check current password ============
      const valid = await this.comparePassword(currentPassword, user.password);

      if (!valid) {
        throw new Error('Incorrect current password');
      }

      // set new password
      await models.ClientPortalUsers.findByIdAndUpdate(
        { _id: user._id },
        {
          password: await this.generatePassword(newPassword)
        }
      );

      return models.ClientPortalUsers.findOne({ _id: user._id });
    }

    public static async forgotPassword(
      clientPortalId: string,
      phone: string,
      email: string
    ) {
      const query: any = { clientPortalId };

      let isEmail = false;

      if (email) {
        query.email = email;
        isEmail = true;
      }

      if (phone) {
        query.phone = phone;
      }

      const user = await models.ClientPortalUsers.getUser(query);

      if (isEmail) {
        // create the random token
        const buffer = await crypto.randomBytes(20);
        const token = buffer.toString('hex');

        // save token & expiration date
        await models.ClientPortalUsers.findByIdAndUpdate(
          { _id: user._id },
          {
            resetPasswordToken: token,
            resetPasswordExpires: Date.now() + 86400000
          }
        );

        return { token };
      }

      const phoneCode = await this.imposeVerificationCode({
        phone,
        isRessetting: true
      });

      return { phoneCode };
    }

    public static async changePasswordWithCode({
      phone,
      code,
      password
    }: {
      phone: string;
      code: string;
      password: string;
    }) {
      const user = await models.ClientPortalUsers.findOne({
        phone,
        resetPasswordToken: code
      }).lean();

      if (!user) {
        throw new Error('Wrong code');
      }

      // Password can not be empty string
      if (password === '') {
        throw new Error('Password can not be empty');
      }

      this.checkPassword(password);

      // set new password
      await models.ClientPortalUsers.findByIdAndUpdate(
        { _id: user._id },
        {
          password: await this.generatePassword(password)
        }
      );

      return 'success';
    }

    public static async createTokens(_user: IUserDocument, secret: string) {
      const user = {
        _id: _user._id,
        email: _user.email,
        firstName: _user.firstName,
        lastName: _user.lastName
      };

      const createToken = await jwt.sign({ user }, secret, { expiresIn: '1d' });

      const createRefreshToken = await jwt.sign({ user }, secret, {
        expiresIn: '7d'
      });

      return [createToken, createRefreshToken];
    }

    public static async refreshTokens(refreshToken: string) {
      let _id = '';

      try {
        // validate refresh token
        const { user }: any = jwt.verify(refreshToken, this.getSecret());

        _id = user._id;
        // if refresh token is expired then force to login
      } catch (e) {
        return {};
      }

      const dbUsers = await models.ClientPortalUsers.findOne({ _id });

      if (!dbUsers) {
        throw new Error('User not found');
      }

      // recreate tokens
      const [newToken, newRefreshToken] = await this.createTokens(
        dbUsers,
        this.getSecret()
      );

      return {
        token: newToken,
        refreshToken: newRefreshToken,
        user: dbUsers
      };
    }

    static generateVerificationCode() {
      return randomize('0', 6);
    }

    public static async imposeVerificationCode({
      phone,
      email,
      isRessetting
    }: {
      phone?: string;
      email?: string;
      isRessetting?: boolean;
    }) {
      const user = await models.ClientPortalUsers.findOne({
        $or: [{ phone }, { email }]
      });

      const code = this.generateVerificationCode();
      const codeExpires = Date.now() + 60000;

      if (!user) {
        throw new Error('User not found');
      }

      let query: any = {
        phoneVerificationCode: code,
        phoneVerificationCodeExpires: codeExpires
      };

      if (email) {
        query = {
          emailVerificationCode: code,
          emailVerificationCodeExpires: codeExpires
        };
      }

      if (isRessetting) {
        await models.ClientPortalUsers.updateOne(
          { _id: user._id },
          {
            $set: {
              resetPasswordToken: code,
              resetPasswordExpires: codeExpires
            }
          }
        );

        return code;
      }

      await models.ClientPortalUsers.updateOne(
        { _id: user._id },
        {
          $set: query
        }
      );

      return code;
    }

    public static async verifyUser(args: IVerificationParams) {
      const { phoneOtp, emailOtp, userId } = args;
      const user = await models.ClientPortalUsers.findById(userId);

      if (!user) {
        throw new Error('user not found');
      }

      const now = new Date().getTime();

      if (phoneOtp) {
        if (
          new Date(user.phoneVerificationCodeExpires).getTime() < now ||
          user.phoneVerificationCode !== phoneOtp
        ) {
          throw new Error('Wrong code or code has expired');
        }
        user.isPhoneVerified = true;
        user.phoneVerificationCode = '';
      }

      if (emailOtp) {
        if (
          new Date(user.emailVerificationCodeExpires).getTime() < now ||
          user.emailVerificationCode !== emailOtp
        ) {
          throw new Error('Wrong code or code has expired');
        }
        user.isEmailVerified = true;
        user.emailVerificationCode = '';
      }

      await user.save();

      return 'verified';
    }

    public static async login({
      login,
      password,
      deviceToken,
      clientPortalId
    }: ILoginParams) {
      if (!login || !password || !clientPortalId) {
        throw new Error('Invalid login');
      }

      const user = await models.ClientPortalUsers.findOne({
        $or: [
          { email: { $regex: new RegExp(`^${login}$`, 'i') } },
          { username: { $regex: new RegExp(`^${login}$`, 'i') } },
          { phone: { $regex: new RegExp(`^${login}$`, 'i') } }
        ],
        clientPortalId
      });

      if (!user || !user.password) {
        throw new Error('Invalid login');
      }

      const valid = await this.comparePassword(password, user.password);

      if (!valid) {
        // bad password
        throw new Error('Invalid login');
      }

      if (!user.email && !user.phone) {
        // not verified email or phone
        throw new Error('Account not verified');
      }

      if (deviceToken) {
        const deviceTokens: string[] = user.deviceTokens || [];

        if (!deviceTokens.includes(deviceToken)) {
          deviceTokens.push(deviceToken);

          await user.update({ $set: { deviceTokens } });
        }
      }

      return createJwtToken({ userId: user._id });
    }
  }

  clientPortalUserSchema.loadClass(ClientPortalUser);

  return clientPortalUserSchema;
};
