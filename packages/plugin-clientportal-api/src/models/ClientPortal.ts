import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import * as randomize from 'randomatic';
import { Model } from 'mongoose';
import { IContext, IModels } from '../connectionResolver';
import {
  clientPortalSchema,
  clientPortalUserSchema,
  IClientPortal,
  IClientPortalDocument,
  IOTPConfig,
  IUser,
  IUserDocument
} from './definitions/clientPortal';
import * as sha256 from 'sha256';
import { sendContactsMessage } from '../messageBroker';
import { sendSms } from '../utils';

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

interface ILoginParams {
  type?: string;
  email: string;
  password: string;
  deviceToken?: string;
  description?: string;
}

export interface IUserModel extends Model<IUserDocument> {
  checkPassword(password: string): void;
  getSecret(): string;
  generateToken(): { token: string; expires: Date };
  createUser(
    subdomain: string,
    doc: IUser,
    config: IClientPortalDocument
  ): Promise<IUserDocument>;
  editProfile(_id: string, doc: IEditProfile): Promise<IUserDocument>;
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
  clientPortalForgotPassword(email: string): string;
  createTokens(_user: IUserDocument, secret: string): string[];
  refreshTokens(
    refreshToken: string
  ): { token: string; refreshToken: string; user: IUserDocument };
  login(args: ILoginParams): { token: string; refreshToken: string };
  imposeVerificationCodePhone(phone: string): string;
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

    public static async sendVerification(
      subdomain: string,
      config: IOTPConfig,
      phone?: string,
      email?: string
    ) {
      if (phone) {
        const phoneCode = await this.imposeVerificationCodePhone(phone);

        const body =
          config.content.replace(/{.*}/, phoneCode) ||
          `Your verification code is ${phoneCode}`;

        await sendSms(subdomain, config.smsTransporterType, phone, body);
      }

      if (email) {
        console.log(email);
      }
    }

    public static async createUser(
      subdomain: string,
      { password, email, phone, clientPortalId, ...doc }: IUser,
      config: IClientPortalDocument
    ) {
      if (password) this.checkPassword(password);

      const document: any = doc;

      const tEmail = (email || '').toLowerCase().trim();

      const customer = await sendContactsMessage({
        subdomain,
        action: 'customers.findOne',
        data: { customerPrimaryEmail: tEmail, customerPrimaryPhone: phone },
        isRPC: true
      });

      if (
        tEmail &&
        (await models.ClientPortalUsers.findOne({ email: tEmail }))
      ) {
        throw new Error('The user is already exists');
      }

      if (phone && (await models.ClientPortalUsers.findOne({ phone }))) {
        throw new Error('The user is already exists');
      }

      if (tEmail) {
        document.email = tEmail;
      }

      if (phone) {
        document.phone = phone;
      }

      const user = await models.ClientPortalUsers.create({
        ...document,
        clientPortalId: config._id,
        // hash password
        password: await this.generatePassword(password)
      });

      if (config.otpConfig) {
        this.sendVerification(subdomain, config.otpConfig, phone, tEmail);
      }

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
      return customer._id;
    }

    public static async editProfile(
      _id: string,
      { password, ...doc }: IUser,
      subdomain: string
    ) {
      const user = await models.ClientPortalUsers.findOne({ _id }).lean();

      if (!user) {
        throw new Error('User not found');
      }

      // check current password ============
      const valid = await this.comparePassword(password, user.password);

      if (!valid) {
        throw new Error('Incorrect current password');
      }

      const email = doc.email;

      const erxesCustomerId = user.erxesCustomerId;

      // Checking duplicated email
      const exisitingUser = await models.ClientPortalUsers.findOne({
        email
      }).lean();

      if (exisitingUser) {
        throw new Error('Email duplicated');
      }

      await models.ClientPortalUsers.updateOne({ _id }, { $set: doc });

      const customer = await sendContactsMessage({
        subdomain,
        action: 'customers.updateCustomer',
        data: { _id: erxesCustomerId, doc },
        isRPC: true
      });

      if (customer && customer._id) {
        await models.ClientPortalUsers.updateOne(
          { _id: user._id },
          { $set: { erxesCustomerId: customer._id } }
        );

        return user._id;
      }

      return models.ClientPortalUsers.findOne({ _id });
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

    public static async clientPortalForgotPassword(email: string) {
      const user = await models.ClientPortalUsers.findOne({ email });

      if (!user) {
        throw new Error('Invalid email');
      }

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

      return token;
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
        verificationCode: code
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

    public static async imposeVerificationCode(phone: string) {
      const user = await models.ClientPortalUsers.findOne({ phone });
      const code = this.generateVerificationCode();
      const codeExpires = Date.now() + 60000;

      if (!user) {
        throw new Error('User not found');
      }

      await models.ClientPortalUsers.updateOne(
        { _id: user._id },
        {
          $set: { verificationCode: code, verificationCodeExpires: codeExpires }
        }
      );

      return code;
    }

    public static async login({
      email,
      password,
      description,
      deviceToken
    }: ILoginParams) {
      if (!email || !password) {
        throw new Error('Invalid login');
      }

      const user = await models.ClientPortalUsers.findOne({
        // phone: email.trim(),
        email: { $regex: new RegExp(`^${email}$`, 'i') }
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

      // create tokens
      const [token, refreshToken] = await this.createTokens(
        user,
        this.getSecret()
      );

      if (deviceToken) {
        const deviceTokens: string[] = user.deviceTokens || [];

        if (!deviceTokens.includes(deviceToken)) {
          deviceTokens.push(deviceToken);

          await user.update({ $set: { deviceTokens } });
        }
      }

      // await Logs.createLog({
      //   type: "user",
      //   typeId: user._id,
      //   text: "login",
      //   description,
      // });

      return {
        token,
        refreshToken
      };
    }

    public static async imposeVerificationCodePhone(phone: string) {
      const user = await models.ClientPortalUsers.findOne({ phone });
      const code = this.generateVerificationCode();
      const codeExpires = Date.now() + 60000;

      if (!user) {
        throw new Error('User not found');
      }

      await models.ClientPortalUsers.updateOne(
        { _id: user._id },
        {
          $set: {
            verificationCodePhone: code,
            verificationCodePhoneExpires: codeExpires
          }
        }
      );

      return code;
    }
  }

  clientPortalUserSchema.loadClass(ClientPortalUser);

  return clientPortalUserSchema;
};
