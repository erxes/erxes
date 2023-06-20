import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { Model } from 'mongoose';
import * as randomize from 'randomatic';
import * as sha256 from 'sha256';

import { IModels } from '../connectionResolver';
import { IVerificationParams } from '../graphql/resolvers/mutations/clientPortalUser';
import { sendCommonMessage, sendCoreMessage } from '../messageBroker';
import { generateRandomPassword, sendAfterMutation, sendSms } from '../utils';
import {
  IClientPortal,
  IClientPortalDocument
} from './definitions/clientPortal';
import {
  INotifcationSettings,
  IUser,
  IUserDocument,
  clientPortalUserSchema
} from './definitions/clientPortalUser';
import { DEFAULT_MAIL_CONFIG } from './definitions/constants';
import { handleContacts, putActivityLog } from './utils';

const SALT_WORK_FACTOR = 10;

export interface ILoginParams {
  clientPortalId: string;
  login: string;
  password: string;
  deviceToken?: string;
}

interface IConfirmParams {
  token: string;
  password?: string;
  passwordConfirmation?: string;
  username?: string;
}

export interface IUserModel extends Model<IUserDocument> {
  checkDuplication(clientPortalUserFields: {
    email?: string;
    phone?: string;
    code?: string;
  }): never;
  invite(subdomain: string, doc: IUser): Promise<IUserDocument>;
  getUser(doc: any): Promise<IUserDocument>;
  createUser(subdomain: string, doc: IUser): Promise<IUserDocument>;
  updateUser(
    subdomain: string,
    _id: string,
    doc: IUser
  ): Promise<IUserDocument>;
  removeUser(
    subdomain: string,
    _ids: string[]
  ): Promise<{ n: number; ok: number }>;
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
  forgotPassword(
    clientPortal: IClientPortalDocument,
    phone: string,
    email: string
  ): any;
  createTokens(_user: IUserDocument, secret: string): string[];
  refreshTokens(
    refreshToken: string
  ): { token: string; refreshToken: string; user: IUserDocument };
  login(
    args: ILoginParams
  ): { user: IUserDocument; clientPortal: IClientPortal };
  imposeVerificationCode({
    codeLength,
    clientPortalId,
    phone,
    email,
    isRessetting
  }: {
    codeLength: number;
    clientPortalId: string;
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
  verifyUser(args: IVerificationParams): Promise<IUserDocument>;
  verifyUsers(
    subdomain: string,
    userids: string[],
    type: string
  ): Promise<IUserDocument>;
  confirmInvitation(
    subdomain: string,
    params: IConfirmParams
  ): Promise<IUserDocument>;
  updateSession(_id: string): Promise<IUserDocument>;
  updateNotificationSettings(
    _id: string,
    doc: INotifcationSettings
  ): Promise<IUserDocument>;
  loginWithPhone(
    subdomain: string,
    clientPortal: IClientPortalDocument,
    phone: string,
    deviceToken?: string
  ): Promise<{ userId: string; phoneCode: string }>;
}

export const loadClientPortalUserClass = (models: IModels) => {
  class ClientPortalUser {
    public static async checkDuplication(
      clientPortalUserFields: {
        email?: string;
        phone?: string;
        code?: string;
      },
      idsToExclude?: string[] | string
    ) {
      const query: { status: {}; [key: string]: any } = {
        status: { $ne: 'deleted' }
      };
      let previousEntry;

      if (idsToExclude) {
        query._id = { $nin: idsToExclude };
      }

      if (!clientPortalUserFields) {
        return;
      }

      if (clientPortalUserFields.email) {
        // check duplication from primaryName
        previousEntry = await models.ClientPortalUsers.find({
          email: clientPortalUserFields.email
        });

        if (previousEntry.length > 0) {
          throw new Error('Duplicated email');
        }
      }

      if (clientPortalUserFields.phone) {
        // check duplication from primaryName
        previousEntry = await models.ClientPortalUsers.find({
          ...query,
          phone: clientPortalUserFields.phone
        });

        if (previousEntry.length > 0) {
          throw new Error('Duplicated phone');
        }
      }

      if (clientPortalUserFields.code) {
        // check duplication from code
        previousEntry = await models.ClientPortalUsers.find({
          ...query,
          code: clientPortalUserFields.code
        });

        if (previousEntry.length > 0) {
          throw new Error('Duplicated code');
        }
      }
    }

    public static async createUser(
      subdomain: string,
      { password, clientPortalId, ...doc }: IUser
    ) {
      const clientPortal = await models.ClientPortals.getConfig(clientPortalId);

      if (!clientPortal.otpConfig && !clientPortal.mailConfig && !password) {
        throw new Error('Password is required');
      }

      if (password) {
        this.checkPassword(password);
      }

      const document = {
        ...doc,
        isEmailVerified: false,
        isPhoneVerified: false
      };

      if (doc.email && !clientPortal.mailConfig) {
        document.isEmailVerified = true;
      }

      if (doc.phone && !clientPortal.otpConfig) {
        document.isPhoneVerified = true;
      }

      if (doc.customFieldsData) {
        // clean custom field values
        doc.customFieldsData = await sendCommonMessage({
          serviceName: 'forms',
          subdomain,
          action: 'fields.prepareCustomFieldsData',
          data: doc.customFieldsData,
          isRPC: true
        });
      }

      const user = await handleContacts({
        subdomain,
        models,
        clientPortalId,
        document,
        password
      });

      if (user.email && clientPortal.mailConfig) {
        const {
          token,
          expires
        } = await models.ClientPortalUsers.generateToken();

        user.registrationToken = token;
        user.registrationTokenExpires = expires;

        await user.save();

        const link = `${clientPortal.url}/verify?token=${token}`;

        const content = (
          clientPortal.mailConfig.registrationContent ||
          DEFAULT_MAIL_CONFIG.REGISTER
        ).replace(/{{.*}}/, link);

        await sendCoreMessage({
          subdomain,
          action: 'sendEmail',
          data: {
            toEmails: [user.email],
            title:
              clientPortal.mailConfig.subject || 'Registration confirmation',
            template: {
              name: 'base',
              data: {
                content
              }
            }
          }
        });
      }

      if (user.phone && clientPortal.otpConfig) {
        const phoneCode = await this.imposeVerificationCode({
          clientPortalId,
          codeLength: clientPortal.otpConfig.codeLength,
          phone: user.phone
        });

        const smsBody =
          clientPortal.otpConfig.content.replace(/{{.*}}/, phoneCode) ||
          `Your verification code is ${phoneCode}`;

        await sendSms(
          subdomain,
          clientPortal.otpConfig.smsTransporterType,
          user.phone,
          smsBody
        );
      }

      await sendAfterMutation(
        subdomain,
        'clientportal:user',
        'create',
        user,
        user,
        `User's profile has been created on ${clientPortal.name}`
      );

      return user;
    }

    public static async updateUser(subdomain, _id, doc: IUser) {
      if (doc.customFieldsData) {
        // clean custom field values
        doc.customFieldsData = await sendCommonMessage({
          serviceName: 'forms',
          subdomain,
          action: 'fields.prepareCustomFieldsData',
          data: doc.customFieldsData,
          isRPC: true
        });
      }

      await models.ClientPortalUsers.updateOne(
        { _id },
        { $set: { ...doc, modifiedAt: new Date() } }
      );

      return models.ClientPortalUsers.findOne({ _id });
    }

    /**
     * Remove remove Client Portal Users
     */
    public static async removeUser(
      subdomain: string,
      clientPortalUserIds: string[]
    ) {
      // Removing every modules that associated with customer

      const users = await models.ClientPortalUsers.find({
        _id: { $in: clientPortalUserIds }
      });

      for (const user of users) {
        await sendAfterMutation(
          subdomain,
          'clientportal:user',
          'delete',
          user,
          user,
          `User's profile has been removed`
        );
      }

      return models.ClientPortalUsers.deleteMany({
        _id: { $in: clientPortalUserIds }
      });
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
      await models.ClientPortalUsers.findByIdAndUpdate(user._id, {
        password: await this.generatePassword(newPassword),
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined
      });

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

      const user = await models.ClientPortalUsers.findOne({
        _id
      }).lean();

      if (!user) {
        throw new Error('User not found');
      }

      // check current password ============
      const valid = await this.comparePassword(currentPassword, user.password);

      if (!valid) {
        throw new Error('Incorrect current password');
      }

      // set new password
      await models.ClientPortalUsers.findByIdAndUpdate(user._id, {
        password: await this.generatePassword(newPassword)
      });

      return models.ClientPortalUsers.findOne({ _id: user._id });
    }

    public static async forgotPassword(
      clientPortal: IClientPortalDocument,
      phone: string,
      email: string
    ) {
      const query: any = { clientPortalId: clientPortal._id };

      const isEmail = clientPortal.passwordVerificationConfig
        ? !clientPortal.passwordVerificationConfig.verifyByOTP
        : true;

      if (email) {
        query.email = email;
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
        await models.ClientPortalUsers.findByIdAndUpdate(user._id, {
          resetPasswordToken: token,
          resetPasswordExpires: Date.now() + 86400000
        });

        return { token };
      }

      const phoneCode = await this.imposeVerificationCode({
        codeLength: clientPortal.otpConfig
          ? clientPortal.otpConfig.codeLength
          : 4,
        clientPortalId: clientPortal._id,
        phone,
        email,
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
        $or: [
          { email: { $regex: new RegExp(`^${phone}$`, 'i') } },
          { phone: { $regex: new RegExp(`^${phone}$`, 'i') } }
        ],
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

      if (phone.includes('@')) {
        await models.ClientPortalUsers.findByIdAndUpdate(user._id, {
          isEmailVerified: true,
          password: await this.generatePassword(password)
        });

        return 'success';
      }

      // set new password
      await models.ClientPortalUsers.findByIdAndUpdate(user._id, {
        isPhoneVerified: true,
        password: await this.generatePassword(password)
      });

      return 'success';
    }

    public static async createTokens(_user: IUserDocument, secret: string) {
      const user = {
        _id: _user._id,
        email: _user.email,
        firstName: _user.firstName,
        lastName: _user.lastName
      };

      const createToken = await jwt.sign({ user }, secret, {
        expiresIn: '1d'
      });

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

    static generateVerificationCode(codeLenth: number) {
      return randomize('0', codeLenth);
    }

    public static async imposeVerificationCode({
      codeLength,
      clientPortalId,
      phone,
      email,
      expireAfter,
      isRessetting
    }: {
      codeLength: number;
      clientPortalId: string;
      phone?: string;
      email?: string;
      expireAfter?: number;
      isRessetting?: boolean;
    }) {
      const code = this.generateVerificationCode(codeLength);
      const codeExpires = Date.now() + 60000 * (expireAfter || 5);

      let query: any = {};
      let userFindQuery: any = {};

      if (phone) {
        query = {
          phoneVerificationCode: code,
          phoneVerificationCodeExpires: codeExpires
        };
        userFindQuery = { phone, clientPortalId };
      }

      if (email) {
        query = {
          emailVerificationCode: code,
          emailVerificationCodeExpires: codeExpires
        };
        userFindQuery = { email, clientPortalId };
      }

      const user = await models.ClientPortalUsers.findOne(userFindQuery);

      if (!user) {
        throw new Error('User not found');
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
      const { phoneOtp, emailOtp, userId, password } = args;
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

      if (password) {
        this.checkPassword(password);
        user.password = await this.generatePassword(password);
      }

      await user.save();

      await putActivityLog(user);

      return user;
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

      if (!user.isPhoneVerified && !user.isEmailVerified) {
        throw new Error('User is not verified');
      }

      const cp = await models.ClientPortals.getConfig(clientPortalId);

      if (
        cp.manualVerificationConfig &&
        user.type === 'customer' &&
        user.verificationRequest &&
        user.verificationRequest.status !== 'verified' &&
        cp.manualVerificationConfig.verifyCustomer
      ) {
        throw new Error('User is not verified');
      }

      if (
        cp.manualVerificationConfig &&
        user.type === 'company' &&
        user.verificationRequest &&
        user.verificationRequest.status !== 'verified' &&
        cp.manualVerificationConfig.verifyCompany
      ) {
        throw new Error('User is not verified');
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

      this.updateSession(user._id);

      return {
        user,
        clientPortal: cp
      };
    }

    public static async invite(
      subdomain: string,
      { password, clientPortalId, ...doc }: IUser
    ) {
      if (!password) {
        password = generateRandomPassword();
      }

      if (password) {
        this.checkPassword(password);
      }

      const plainPassword = password || '';

      const user = await handleContacts({
        subdomain,
        models,
        clientPortalId,
        document: doc,
        password
      });

      const { token, expires } = await models.ClientPortalUsers.generateToken();

      user.registrationToken = token;
      user.registrationTokenExpires = expires;

      await user.save();

      const clientPortal = await models.ClientPortals.getConfig(clientPortalId);

      const config = clientPortal.mailConfig || {
        invitationContent: DEFAULT_MAIL_CONFIG.INVITE
      };

      const link = `${clientPortal.url}/verify?token=${token}`;

      let content = config.invitationContent.replace(/{{ link }}/, link);
      content = content.replace(/{{ password }}/, plainPassword);

      await sendCoreMessage({
        subdomain,
        action: 'sendEmail',
        data: {
          toEmails: [doc.email],
          title: `${clientPortal.name} invitation`,
          template: {
            name: 'base',
            data: {
              content
            }
          }
        }
      });

      await sendAfterMutation(
        subdomain,
        'clientportal:user',
        'create',
        user,
        user,
        `User's profile has been created on ${clientPortal.name}`
      );

      return user;
    }

    public static async confirmInvitation(
      subdomain,
      {
        token,
        password,
        passwordConfirmation,
        username
      }: {
        token: string;
        password: string;
        passwordConfirmation: string;
        username?: string;
      }
    ) {
      const user = await models.ClientPortalUsers.findOne({
        registrationToken: token,
        registrationTokenExpires: {
          $gt: Date.now()
        }
      });

      if (!user || !token) {
        throw new Error('Token is invalid or has expired');
      }

      const doc: any = { isEmailVerified: true, registrationToken: undefined };

      if (password) {
        if (password !== passwordConfirmation) {
          throw new Error('Password does not match');
        }

        this.checkPassword(password);
        doc.password = await this.generatePassword(password);
      }

      if (username) {
        doc.username = username;
      }

      await models.ClientPortalUsers.updateOne(
        { _id: user._id },
        {
          $set: doc
        }
      );

      await sendAfterMutation(
        subdomain,
        'clientportal:user',
        'create',
        user,
        user,
        `User's profile has been created`
      );

      return user;
    }

    public static async verifyUsers(
      subdomain: string,
      userIds: string[],
      type: string
    ) {
      const qryOption =
        type === 'phone' ? { phone: { $ne: null } } : { email: { $ne: null } };

      const set =
        type === 'phone'
          ? { isPhoneVerified: true }
          : { isEmailVerified: true };

      const users = await models.ClientPortalUsers.find({
        _id: { $in: userIds },
        ...qryOption
      });

      if (!users || !users.length) {
        throw new Error('Users not found');
      }

      await models.ClientPortalUsers.updateMany(
        { _id: { $in: userIds } },
        {
          $set: set
        }
      );

      for (const user of users) {
        await putActivityLog(user);

        await sendAfterMutation(
          subdomain,
          'clientportal:user',
          'create',
          user,
          user,
          `User's profile has been created`
        );
      }

      return users;
    }

    /*
     * Update session data
     */
    public static async updateSession(_id: string) {
      const now = new Date();

      const query: any = {
        $set: {
          lastSeenAt: now,
          isOnline: true
        },
        $inc: { sessionCount: 1 }
      };

      // update
      await models.ClientPortalUsers.findByIdAndUpdate(_id, query);

      // updated customer
      return models.ClientPortalUsers.findOne({ _id });
    }

    /*
     *Update notification settings
     */
    public static async updateNotificationSettings(
      _id: string,
      doc: INotifcationSettings
    ): Promise<IUser> {
      const user = await models.ClientPortalUsers.findOne({ _id });

      if (!user) {
        throw new Error('User not found');
      }

      await models.ClientPortalUsers.updateOne(
        { _id },
        {
          $set: {
            notificationSettings: { ...doc }
          }
        }
      );

      return models.ClientPortalUsers.getUser({ _id });
    }

    /*
     * login with phone
     */
    public static async loginWithPhone(
      subdomain: string,
      clientPortal: IClientPortalDocument,
      phone: string,
      deviceToken?: string
    ) {
      let user = await models.ClientPortalUsers.findOne({
        phone,
        clientPortalId: clientPortal._id
      });

      if (!user) {
        user = await handleContacts({
          subdomain,
          models,
          clientPortalId: clientPortal._id,
          document: { phone }
        });
      }

      if (!user) {
        throw new Error('Can not create user');
      }

      if (deviceToken) {
        const deviceTokens: string[] = user.deviceTokens || [];

        if (!deviceTokens.includes(deviceToken)) {
          deviceTokens.push(deviceToken);

          await user.update({ $set: { deviceTokens } });
        }
      }

      this.updateSession(user._id);

      const config = clientPortal.otpConfig || {
        codeLength: 4,
        expireAfter: 1
      };

      const phoneCode = await this.imposeVerificationCode({
        clientPortalId: clientPortal._id,
        codeLength: config.codeLength,
        phone: user.phone,
        expireAfter: config.expireAfter
      });

      return { userId: user._id, phoneCode };
    }
  }

  clientPortalUserSchema.loadClass(ClientPortalUser);

  return clientPortalUserSchema;
};
