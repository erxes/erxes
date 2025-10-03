import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { Model } from 'mongoose';

import { escapeRegExp, random, sendTRPCMessage } from 'erxes-api-shared/utils';
import sha256 from 'sha256';
import { IModels } from '~/connectionResolvers';

import { IPortal, IPortalDocument } from '@/portal/@types/portal';
import {
  IInvitiation,
  INotifcationSettings,
  IUser,
  IUserDocument,
  IVerificationParams,
} from '@/portal/@types/user';
import { userSchema } from '@/portal/db/definitions/user';
// import { DEFAULT_MAIL_CONFIG } from '@/portal/constants';
import { handleContacts, handleDeviceToken } from '@/portal/utils/contacts';
import { sendSms } from '@/portal/utils/common';

const SALT_WORK_FACTOR = 10;

export interface ILoginParams {
  clientPortalId: string;
  login: string;
  password: string;
  deviceToken?: string;
  twoFactor?: { key?: string; device?: string };
}

interface IConfirmParams {
  token: string;
  password?: string;
  passwordConfirmation?: string;
  username?: string;
}

export interface IUserModel extends Model<IUserDocument> {
  checkDuplication(userFields: {
    email?: string;
    phone?: string;
    code?: string;
  }): never;
  invite(doc: IInvitiation): Promise<IUserDocument>;
  createTestUser(doc: IInvitiation): Promise<IUserDocument>;
  getUser(doc: any): Promise<IUserDocument>;
  createUser(doc: IUser): Promise<IUserDocument>;
  updateUser(_id: string, doc: IUser): Promise<IUserDocument>;
  removeUser(_ids: string[]): Promise<{ n: number; ok: number }>;
  checkPassword(password: string): void;
  getSecret(): string;
  generateToken(): { token: string; expires: Date };
  generatePassword(password: string): Promise<string>;
  comparePassword(password: string, userPassword: string): boolean;
  clientPortalResetPassword({
    token,
    newPassword,
  }: {
    token: string;
    newPassword: string;
  }): Promise<IUserDocument>;
  changePassword({
    _id,
    currentPassword,
    newPassword,
  }: {
    _id: string;
    currentPassword: string;
    newPassword: string;
  }): Promise<IUserDocument>;
  forgotPassword(portal: IPortalDocument, phone: string, email: string): any;
  createTokens(_user: IUserDocument, secret: string): string[];
  refreshTokens(refreshToken: string): {
    token: string;
    refreshToken: string;
    user: IUserDocument;
  };
  login(args: ILoginParams): {
    user: IUserDocument;
    portal: IPortal;
    isPassed2FA: boolean;
  };
  imposeVerificationCode({
    codeLength,
    clientPortalId,
    phone,
    email,
    isRessetting,
    expireAfter,
    testUserOTP,
  }: {
    codeLength: number;
    clientPortalId: string;
    expireAfter?: number;
    phone?: string;
    email?: string;
    isRessetting?: boolean;
    testUserOTP?: number;
  }): string;
  changePasswordWithCode({
    phone,
    code,
    password,
    isSecondary,
  }: {
    phone: string;
    code: string;
    password: string;
    isSecondary: boolean;
  }): string;
  verifyUser(args: IVerificationParams): Promise<IUserDocument>;
  verifyUsers(userids: string[], type: string): Promise<IUserDocument>;
  confirmInvitation(params: IConfirmParams): Promise<IUserDocument>;
  updateSession(_id: string): Promise<IUserDocument>;
  updateNotificationSettings(
    _id: string,
    doc: INotifcationSettings,
  ): Promise<IUserDocument>;
  loginWithPhone(
    portal: IPortalDocument,
    phone: string,
    deviceToken?: string,
  ): Promise<{ userId: string; phoneCode: string }>;
  loginWithSocialpay(
    portal: IPortalDocument,
    user: IUser,
    deviceToken?: string,
  ): Promise<{ userId: string; phoneCode: string }>;
  loginWithoutPassword(
    portal: IPortalDocument,
    doc: any,
    deviceToken?: string,
  ): IUserDocument;
  setSecondaryPassword(
    userId: string,
    secondaryPassword: string,
    oldPassword?: string,
  ): Promise<string>;
  validatePassword(
    userId: string,
    password: string,
    secondary?: boolean,
  ): boolean;
  moveUser(
    oldportalId: string,
    newportalId: string,
  ): Promise<{ userIds: string[]; clientPortalId: string }>;
}

export const loadUserClass = (models: IModels) => {
  class User {
    public static async checkDuplication(
      userFields: {
        email?: string;
        phone?: string;
        code?: string;
      },
      idsToExclude?: string[] | string,
    ) {
      const query: { [key: string]: any } = {
        status: { $ne: 'deleted' },
      };
      let previousEntry;

      if (idsToExclude) {
        query._id = { $nin: idsToExclude };
      }

      if (!userFields) {
        return;
      }

      if (userFields.email) {
        // check duplication from primaryName
        previousEntry = await models.Users.find({
          email: userFields.email,
        });

        if (previousEntry.length > 0) {
          throw new Error('Duplicated email');
        }
      }

      if (userFields.phone) {
        // check duplication from primaryName
        previousEntry = await models.Users.find({
          ...query,
          phone: userFields.phone,
        });

        if (previousEntry.length > 0) {
          throw new Error('Duplicated phone');
        }
      }

      if (userFields.code) {
        // check duplication from code
        previousEntry = await models.Users.find({
          ...query,
          code: userFields.code,
        });

        if (previousEntry.length > 0) {
          throw new Error('Duplicated code');
        }
      }
    }

    public static async createUser({
      password,
      clientPortalId,
      ...doc
    }: IUser) {
      const portal = await models.Portals.getConfig(clientPortalId);

      if (!portal.otpConfig && !portal.mailConfig && !password) {
        throw new Error('Password is required');
      }

      if (password) {
        this.checkPassword(password);
      }

      const document = {
        ...doc,
        isEmailVerified: false,
        isPhoneVerified: false,
      };

      if (doc.email && !portal.mailConfig) {
        document.isEmailVerified = true;
      }

      if (doc.phone && !portal.otpConfig) {
        document.isPhoneVerified = true;
      }

      // TODO: implement custom fields after forms migrated
      if (doc.customFieldsData) {
        doc.customFieldsData = await sendTRPCMessage({
          pluginName: 'core',
          method: 'query',
          module: 'fields',
          action: 'prepareCustomFieldsData',
          input: { customFieldsData: doc.customFieldsData },
        });
      }

      const user = await handleContacts({
        models,
        clientPortalId,
        document,
        password,
      });

      if (user.email && portal.mailConfig) {
        const { token, expires } = await models.Users.generateToken();

        user.registrationToken = token;
        user.registrationTokenExpires = expires;

        await user.save();
        // TODO: implement sendEmail after migration
        // const link = `${portal.url}/verify?token=${token}`;

        // const content = (
        //   portal.mailConfig.registrationContent ||
        //   DEFAULT_MAIL_CONFIG.REGISTER
        // ).replace(/{{.*}}/, link);

        // await sendCoreMessage({
        //
        //   action: 'sendEmail',
        //   data: {
        //     toEmails: [user.email],
        //     title:
        //       portal.mailConfig.subject || 'Registration confirmation',
        //     template: {
        //       name: 'base',
        //       data: {
        //         content,
        //       },
        //     },
        //   },
        // });
      }

      if (user.phone && portal.otpConfig) {
        const phoneCode = await this.imposeVerificationCode({
          clientPortalId,
          codeLength: portal.otpConfig.codeLength,
          phone: user.phone,
        });

        const smsBody =
          portal.otpConfig.content.replace(/{{.*}}/, phoneCode) ||
          `Your verification code is ${phoneCode}`;

        await sendSms(portal.otpConfig.smsTransporterType, user.phone, smsBody);
      }

      // TODO: consider following function necessary
      // await sendAfterMutation(
      //
      //   'clientportal:user',
      //   'create',
      //   user,
      //   user,
      //   `User's profile has been created on ${portal.name}`,
      // );

      return user;
    }

    public static async updateUser(_id, doc: IUser) {
      if (doc.customFieldsData) {
        doc.customFieldsData = await sendTRPCMessage({
          pluginName: 'core',
          method: 'query',
          module: 'fields',
          action: 'prepareCustomFieldsData',
          input: { customFieldsData: doc.customFieldsData },
        });
      }

      if (doc.password) {
        this.checkPassword(doc.password);
        doc.password = await this.generatePassword(doc.password);
      }

      await models.Users.updateOne(
        { _id },
        { $set: { ...doc, modifiedAt: new Date() } },
      );

      return models.Users.findOne({ _id });
    }

    /**
     * Remove remove Business Portal Users
     */
    public static async removeUser(clientPortalUserIds: string[]) {
      // Removing every modules that associated with customer
      // TODO: implement sendAfterMutation after migration
      // const users = await models.Users.find({
      //   _id: { $in: clientPortalUserIds },
      // });

      // for (const user of users) {
      //   await sendAfterMutation(
      //
      //     'clientportal:user',
      //     'delete',
      //     user,
      //     user,
      //     `User's profile has been removed`,
      //   );
      // }

      return models.Users.deleteMany({
        _id: { $in: clientPortalUserIds },
      });
    }

    public static async getUser(doc: any) {
      const user = await models.Users.findOne(doc);

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
        expires: Date.now() + 86400000,
      };
    }

    public static checkPassword(password: string) {
      if (!password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/)) {
        throw new Error(
          'Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters',
        );
      }
    }

    public static async clientPortalResetPassword({
      token,
      newPassword,
    }: {
      token: string;
      newPassword: string;
    }) {
      const user = await models.Users.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: {
          $gt: Date.now(),
        },
      });

      if (!user) {
        throw new Error('Password reset token is invalid or has expired.');
      }

      if (!newPassword) {
        throw new Error('Password is required.');
      }

      this.checkPassword(newPassword);

      // set new password
      await models.Users.findByIdAndUpdate(user._id, {
        password: await this.generatePassword(newPassword),
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined,
      });

      return models.Users.findOne({ _id: user._id });
    }

    public static async changePassword({
      _id,
      currentPassword,
      newPassword,
    }: {
      _id: string;
      currentPassword: string;
      newPassword: string;
    }) {
      // Password cannot be empty string
      if (newPassword === '') {
        throw new Error('Password cannot be empty');
      }

      this.checkPassword(newPassword);

      const user = await models.Users.findOne({
        _id,
      }).lean();

      if (!user) {
        throw new Error('User not found');
      }

      // check current password ============
      const valid = user.password
        ? await this.comparePassword(currentPassword, user.password)
        : false;

      if (!valid) {
        throw new Error('Incorrect current password');
      }

      // set new password
      await models.Users.findByIdAndUpdate(user._id, {
        password: await this.generatePassword(newPassword),
      });

      return models.Users.findOne({ _id: user._id });
    }

    public static async forgotPassword(
      portal: IPortalDocument,
      phone: string,
      email: string,
    ) {
      const query: any = { clientPortalId: portal._id };

      const isEmail = portal.passwordVerificationConfig
        ? !portal.passwordVerificationConfig.verifyByOTP
        : true;

      if (email) {
        query.email = email;
      }

      if (phone) {
        query.phone = phone;
      }

      const user = await models.Users.getUser(query);

      if (isEmail) {
        // create the random token
        const buffer = await crypto.randomBytes(20);
        const token = buffer.toString('hex');

        // save token & expiration date
        await models.Users.findByIdAndUpdate(user._id, {
          resetPasswordToken: token,
          resetPasswordExpires: Date.now() + 86400000,
        });

        return { token };
      }

      const phoneCode = await this.imposeVerificationCode({
        codeLength: portal.otpConfig ? portal.otpConfig.codeLength : 4,
        clientPortalId: portal._id,
        phone,
        email,
        isRessetting: true,
      });

      return { phoneCode };
    }

    public static async changePasswordWithCode({
      phone,
      code,
      password,
      isSecondary = false,
    }: {
      phone: string;
      code: string;
      password: string;
      isSecondary: boolean;
    }) {
      const user = await models.Users.findOne({
        $or: [
          { email: { $regex: new RegExp(`^${phone}$`, 'i') } },
          { phone: { $regex: new RegExp(`^${phone}$`, 'i') } },
        ],
        resetPasswordToken: code,
      }).lean();

      if (!user) {
        throw new Error('Wrong code');
      }

      // Password cannot be empty string
      if (password === '') {
        throw new Error('Password cannot be empty');
      }

      this.checkPassword(password);

      if (phone.includes('@')) {
        const field = isSecondary ? 'secondaryPassword' : 'password';
        await models.Users.findByIdAndUpdate(user._id, {
          isEmailVerified: true,
          [field]: await this.generatePassword(password),
        });

        return 'success';
      }

      // set new password
      const field = isSecondary ? 'secondaryPassword' : 'password';

      await models.Users.findByIdAndUpdate(user._id, {
        isPhoneVerified: true,
        [field]: await this.generatePassword(password),
      });

      return 'success';
    }

    public static async createTokens(_user: IUserDocument, secret: string) {
      const user = {
        _id: _user._id,
        email: _user.email,
        firstName: _user.firstName,
        lastName: _user.lastName,
      };

      const createToken = await jwt.sign({ user }, secret, {
        expiresIn: '1d',
      });

      const createRefreshToken = await jwt.sign({ user }, secret, {
        expiresIn: '7d',
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

      const dbUsers = await models.Users.findOne({ _id });

      if (!dbUsers) {
        throw new Error('User not found');
      }

      // recreate tokens
      const [newToken, newRefreshToken] = await this.createTokens(
        dbUsers,
        this.getSecret(),
      );

      return {
        token: newToken,
        refreshToken: newRefreshToken,
        user: dbUsers,
      };
    }

    public static async imposeVerificationCode({
      codeLength,
      clientPortalId,
      phone,
      email,
      expireAfter,
      isRessetting,
      testUserOTP,
    }: {
      codeLength: number;
      clientPortalId: string;
      phone?: string;
      email?: string;
      expireAfter?: number;
      isRessetting?: boolean;
      testUserOTP?: string;
    }) {
      const code = testUserOTP ? testUserOTP : random('0', codeLength);
      const codeExpires = Date.now() + 60000 * (expireAfter || 5);

      let query: any = {};
      let userFindQuery: any = {};

      if (phone) {
        query = {
          phoneVerificationCode: code,
          phoneVerificationCodeExpires: codeExpires,
        };
        userFindQuery = { phone, clientPortalId };
      }

      if (email) {
        query = {
          emailVerificationCode: code,
          emailVerificationCodeExpires: codeExpires,
        };
        userFindQuery = { email, clientPortalId };
      }

      const user = await models.Users.findOne(userFindQuery);

      if (!user) {
        throw new Error('User not found');
      }

      if (isRessetting) {
        await models.Users.updateOne(
          { _id: user._id },
          {
            $set: {
              resetPasswordToken: code,
              resetPasswordExpires: codeExpires,
            },
          },
        );

        return code;
      }

      await models.Users.updateOne(
        { _id: user._id },
        {
          $set: query,
        },
      );

      return code;
    }

    public static async verifyUser(args: IVerificationParams) {
      const { phoneOtp, emailOtp, userId, password } = args;
      const user = await models.Users.findById(userId);

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

      return user;
    }

    public static async login({
      login,
      password,
      deviceToken,
      clientPortalId,
      twoFactor,
    }: ILoginParams) {
      if (!login || !password || !clientPortalId) {
        throw new Error('Invalid login');
      }

      const user = await models.Users.findOne({
        $or: [
          { email: { $regex: new RegExp(`^${escapeRegExp(login)}$`, 'i') } },
          { username: { $regex: new RegExp(`^${escapeRegExp(login)}$`, 'i') } },
          { phone: { $regex: new RegExp(`^${escapeRegExp(login)}$`, 'i') } },
        ],
        clientPortalId,
      });

      if (!user || !user.password) {
        throw new Error('Invalid login');
      }

      if (!user.isPhoneVerified && !user.isEmailVerified) {
        throw new Error('User is not verified');
      }

      const cp = await models.Portals.getConfig(clientPortalId);

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
      const secondaryPassCheck = await this.comparePassword(
        password,
        user.secondaryPassword || '',
      );

      if (!valid && !secondaryPassCheck) {
        // bad password
        throw new Error('Invalid login');
      }

      if (!user.email && !user.phone) {
        // not verified email or phone
        throw new Error('Account not verified');
      }

      let isFound;
      if (cp.twoFactorConfig?.enableTwoFactor) {
        if (twoFactor && twoFactor.key && twoFactor.device) {
          isFound = user.twoFactorDevices?.find((x) => x.key === twoFactor.key);
        } else {
          throw new Error('TwoFactor argument is required');
        }
      }

      await handleDeviceToken(user, deviceToken);

      this.updateSession(user._id);

      return {
        user,
        portal: cp,
        isPassed2FA: !!isFound,
      };
    }

    public static async createTestUser({
      password,
      clientPortalId,
      ...doc
    }: IInvitiation) {
      if (!password) {
        password = random('Aa0!', 8);
      }

      if (password) {
        this.checkPassword(password);
      }

      return await handleContacts({
        models,
        clientPortalId,
        document: doc,
        password,
      });

      // TODO: improve test user creation
      // const portal = await models.Portals.getConfig(clientPortalId);

      // await sendAfterMutation(
      //
      //   'clientportal:user',
      //   'create',
      //   user,
      //   user,
      //   `User's profile has been created on ${portal.name}`,
      // );

      // return user;
    }

    public static async invite({
      password,
      clientPortalId,
      ...doc
    }: IInvitiation) {
      if (!password) {
        password = random('Aa0!', 8);
      }

      if (password) {
        this.checkPassword(password);
      }

      const plainPassword = password || '';

      const user = await handleContacts({
        models,
        clientPortalId,
        document: doc,
        password,
      });

      const portal = await models.Portals.getConfig(clientPortalId);

      if (!doc.disableVerificationMail) {
        const { token, expires } = await models.Users.generateToken();

        user.registrationToken = token;
        user.registrationTokenExpires = expires;

        await user.save();

        // TODO: implement send email
        // const config = portal.mailConfig || {
        // invitationContent: DEFAULT_MAIL_CONFIG.INVITE,
        // };

        // const link = `${portal.url}/verify?token=${token}`;

        // let content = config.invitationContent.replace(/{{ link }}/, link);
        // content = content.replace(/{{ password }}/, plainPassword);

        // await sendCoreMessage({
        //
        //   action: 'sendEmail',
        //   data: {
        //     toEmails: [doc.email],
        //     title: `${portal.name} invitation`,
        //     template: {
        //       name: 'base',
        //       data: {
        //         content,
        //       },
        //     },
        //   },
        // });
      }

      // TODO: implement back
      // await sendAfterMutation(
      //
      //   'clientportal:user',
      //   'create',
      //   user,
      //   user,
      //   `User's profile has been created on ${portal.name}`,
      // );

      return user;
    }

    public static async confirmInvitation({
      token,
      password,
      passwordConfirmation,
      username,
    }: {
      token: string;
      password: string;
      passwordConfirmation: string;
      username?: string;
    }) {
      const user = await models.Users.findOne({
        registrationToken: token,
        registrationTokenExpires: {
          $gt: Date.now(),
        },
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

      await models.Users.updateOne(
        { _id: user._id },
        {
          $set: doc,
        },
      );

      // TODO: implement back
      // await sendAfterMutation(
      //
      //   'clientportal:user',
      //   'create',
      //   user,
      //   user,
      //   `User's profile has been created`,
      // );

      return user;
    }

    public static async verifyUsers(userIds: string[], type: string) {
      const qryOption =
        type === 'phone' ? { phone: { $ne: null } } : { email: { $ne: null } };

      const set =
        type === 'phone'
          ? { isPhoneVerified: true }
          : { isEmailVerified: true };

      const users = await models.Users.find({
        _id: { $in: userIds },
        ...qryOption,
      });

      if (!users || !users.length) {
        throw new Error('Users not found');
      }

      await models.Users.updateMany(
        { _id: { $in: userIds } },
        {
          $set: set,
        },
      );

      for (const user of users) {
        // await putActivityLog( user);
        // await sendAfterMutation(
        //
        //   'clientportal:user',
        //   'create',
        //   user,
        //   user,
        //   `User's profile has been created`
        // );
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
          isOnline: true,
        },
        $inc: { sessionCount: 1 },
      };

      // update
      await models.Users.findByIdAndUpdate(_id, query);

      // updated customer
      return models.Users.findOne({ _id });
    }

    /*
     *Update notification settings
     */
    public static async updateNotificationSettings(
      _id: string,
      doc: INotifcationSettings,
    ): Promise<IUser> {
      const user = await models.Users.findOne({ _id });

      if (!user) {
        throw new Error('User not found');
      }

      await models.Users.updateOne(
        { _id },
        {
          $set: {
            notificationSettings: { ...doc },
          },
        },
      );

      return models.Users.getUser({ _id });
    }

    /*
     * login with phone
     */
    public static async loginWithPhone(
      portal: IPortalDocument,
      phone: string,
      deviceToken?: string,
    ) {
      let user = await models.Users.findOne({
        phone,
        clientPortalId: portal._id,
      });

      if (!user) {
        user = await handleContacts({
          models,
          clientPortalId: portal._id,
          document: { phone },
        });
      }

      if (!user) {
        throw new Error('cannot create user');
      }

      await handleDeviceToken(user, deviceToken);

      this.updateSession(user._id);

      const config = portal.otpConfig || {
        codeLength: 4,
        expireAfter: 1,
      };

      const phoneCode = await this.imposeVerificationCode({
        clientPortalId: portal._id,
        codeLength: config.codeLength,
        phone: user.phone,
        expireAfter: config.expireAfter,
      });

      return { userId: user._id, phoneCode };
    }

    public static async loginWithoutPassword(
      portal: IPortalDocument,
      doc: IUser,
      deviceToken?: string,
    ) {
      const query: any = [];

      if (doc.email) {
        query.push({
          email: {
            $regex: new RegExp(`^${escapeRegExp(doc.email || '')}$`, 'i'),
          },
        });
      }
      if (doc.phone) {
        query.push({
          phone: {
            $regex: new RegExp(`^${escapeRegExp(doc.phone || '')}$`, 'i'),
          },
        });
      }

      let user = await models.Users.findOne({
        $or: query,
        clientPortalId: portal._id,
      });

      if (!user) {
        user = await handleContacts({
          models,
          clientPortalId: portal._id,
          document: doc,
        });
      }

      if (!user) {
        throw new Error('cannot create user');
      }

      await handleDeviceToken(user, deviceToken);

      this.updateSession(user._id);

      return user;
    }

    public static async setSecondaryPassword(
      userId,
      secondaryPassword,
      oldPassword,
    ) {
      // check if already secondaryPassword exists or not null
      const user = await models.Users.findOne({
        _id: userId,
      });

      if (!user) {
        throw new Error('User not found');
      }

      const newPassword = await this.generatePassword(secondaryPassword);

      if (
        user.secondaryPassword === null ||
        user.secondaryPassword === undefined ||
        !user.secondaryPassword ||
        user.secondaryPassword === ''
      ) {
        // create secondary password
        await models.Users.updateOne(
          { _id: userId },
          { $set: { secondaryPassword: newPassword } },
        );

        return 'Secondary password created';
      }

      // check if old password is correct or not
      if (!oldPassword) {
        throw new Error('Old password is required');
      }

      const valid = await models.Users.comparePassword(
        oldPassword,
        user.secondaryPassword || '',
      );

      if (!valid) {
        // bad password
        throw new Error('Invalid old password');
      }

      // update secondary password
      await models.Users.updateOne(
        { _id: userId },
        { $set: { secondaryPassword: newPassword } },
      );

      return 'Secondary password changed';
    }

    public static async validatePassword(
      userId: string,
      password: string,
      secondary?: boolean,
    ) {
      const user = await models.Users.findOne({
        _id: userId,
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (secondary) {
        return this.comparePassword(password, user.secondaryPassword || '');
      }

      return this.comparePassword(password, user.password || '');
    }

    public static async moveUser(oldportalId, newportalId) {
      const oldUsers = await models.Users.find({
        clientPortalId: oldportalId,
      });

      const newUsers = await models.Users.find({
        clientPortalId: newportalId,
      });

      if (!oldUsers || !oldUsers.length) {
        throw new Error('Users not found');
      }

      const emailsInNewPortal = newUsers.map((user) => user.email);
      const phonesInNewPortal = newUsers.map((user) => user.phone);

      // Filter users1 to exclude those with matching email or phone in users2
      const usersToUpdate = oldUsers.filter((user) => {
        const emailMatch = user.email && emailsInNewPortal.includes(user.email);
        const phoneMatch = user.phone && phonesInNewPortal.includes(user.phone);
        return !(emailMatch || phoneMatch); // Include users who don't match
      });

      if (!usersToUpdate.length) {
        throw new Error('No users updated because of duplicate email/phone');
      }

      // Get the IDs of the users to update
      const userIdsToUpdate = usersToUpdate.map((user) => user._id);

      const updatedUsers = await models.Users.updateMany(
        { _id: { $in: userIdsToUpdate } },
        { $set: { clientPortalId: newportalId, modifiedAt: new Date() } },
      );

      return updatedUsers;
    }
  }

  userSchema.loadClass(User);

  return userSchema;
};
