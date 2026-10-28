import { saveValidatedToken } from '@/auth/utils';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import {
  EventDispatcherReturn,
  USER_ROLES,
  userSchema,
} from 'erxes-api-shared/core-modules';
import {
  IDetail,
  IEmailSignature,
  ILink,
  IPropertyField,
  IUser,
  IUserDocument,
} from 'erxes-api-shared/core-types';
import {
  escapeRegExp,
  redis,
  withoutPermissionScope,
} from 'erxes-api-shared/utils';
import * as jwt from 'jsonwebtoken';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { sendOnboardNotification } from '~/modules/notifications/utils';
import {
  generateLoginActivityLog,
  generateLogoutActivityLog,
  generateUserUpdateActivityLogs,
  generateUserInvitationActivityLog,
} from '../../meta/activity-log';

const SALT_WORK_FACTOR = 10;

interface IEditProfile {
  username?: string;
  email?: string;
  chatStatus?: string;
  details?: IDetail;
  links?: ILink;
  employeeId?: string;
  propertiesData?: IPropertyField;
}

interface IUpdateUser extends IEditProfile {
  password?: string;
  groupIds?: string[];
  brandIds?: string[];
}

interface IInviteParams {
  email: string;
  password?: string;
}

interface ILoginParams {
  email: string;
  password?: string;
  deviceToken?: string;
  subdomain?: string;
}

interface IPasswordParams {
  _id: string;
  newPassword: string;
}

export interface IUserModel extends Model<IUserDocument> {
  getUser(_id: string): Promise<IUserDocument>;
  checkPassword(password: string): void;
  checkDuplication(params: {
    email?: string;
    idsToExclude?: string | string[];
    emails?: string[];
    employeeId?: string;
    username?: string;
  }): Promise<never>;
  getSecret(): string;
  generateToken(duration?: number): Promise<{ token: string; expires: Date }>;
  createUser(doc: IUser & { notUsePassword?: boolean }): Promise<IUserDocument>;
  updateUser(_id: string, doc: IUpdateUser): Promise<IUserDocument>;
  setPropertyValues(
    _id: string,
    values: Record<string, unknown>,
  ): Promise<IUserDocument | null>;
  editProfile(_id: string, doc: IEditProfile): Promise<IUserDocument>;
  generateUserCode(): Promise<string>;
  generateUserCodeField(): Promise<void>;
  configEmailSignatures(
    _id: string,
    signatures: IEmailSignature[],
  ): Promise<IUserDocument>;
  configGetNotificationByEmail(
    _id: string,
    isAllowed: boolean,
  ): Promise<IUserDocument>;
  setUserActiveOrInactive(_id: string): Promise<IUserDocument>;
  generatePassword(password: string): Promise<string>;
  invite(params: IInviteParams): Promise<string>;
  resendInvitation({ email }: { email: string }): Promise<string>;
  comparePassword(password: string, userPassword: string): Promise<boolean>;
  resetPassword(params: {
    token: string;
    newPassword: string;
  }): Promise<IUserDocument>;
  resetMemberPassword(params: IPasswordParams): Promise<IUserDocument>;
  changePassword(
    params: IPasswordParams & { currentPassword: string },
  ): Promise<IUserDocument>;
  forgotPassword(email: string): Promise<string>;
  createTokens(_user: IUserDocument, secret: string): Promise<string[]>;
  refreshTokens(refreshToken: string): Promise<
    | {
        token: string;
        refreshToken: string;
        user: IUserDocument;
      }
    | Record<string, never>
  >;
  login(params: ILoginParams): Promise<{ token: string; refreshToken: string }>;
  checkLoginAuth({
    email,
    password,
  }: {
    email: string;
    password?: string;
  }): Promise<IUserDocument>;
  getTokenFields(_user: IUserDocument): Promise<IUserDocument>;
  logout(_user: IUserDocument, token: string): Promise<string>;
  findUsers(query: any, options?: any): Promise<IUserDocument[]>;
  setChatStatus(_id: string, status: string): Promise<IUserDocument>;
}

export const loadUserClass = (
  models: IModels,
  subdomain: string,
  // { sendDbEventLog, createActivityLog }: EventDispatcherReturn,
  coreEventHandlers: (
    moduleName: string,
    collectionName: string,
  ) => EventDispatcherReturn,
) => {
  const { sendDbEventLog, createActivityLog } = coreEventHandlers(
    'organization',
    'users',
  );
  class User {
    // Per-key write so values other writers hold in propertiesData survive.
    public static async setPropertyValues(
      _id: string,
      values: Record<string, unknown>,
    ) {
      const prev = await models.Users.getUser(_id);
      const $set: Record<string, unknown> = {};
      const $unset: Record<string, ''> = {};

      for (const [fieldId, value] of Object.entries(values)) {
        if (value === null) {
          $unset[`propertiesData.${fieldId}`] = '';
        } else {
          $set[`propertiesData.${fieldId}`] = value;
        }
      }

      const updated = await models.Users.findOneAndUpdate(
        { _id },
        { $set, $unset },
        { new: true },
      );

      if (updated) {
        sendDbEventLog({
          action: 'update',
          docId: _id,
          currentDocument: updated.toObject(),
          prevDocument: prev.toObject(),
        });
      }

      return updated;
    }

    public static async getUser(_id: string) {
      const user = await models.Users.findOne({ _id });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    }

    public static checkPassword(password: string) {
      if (!password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/)) {
        throw new Error(
          'Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters',
        );
      }
    }
    /**
     * Checking if user has duplicated properties
     */
    public static async checkDuplication({
      email,
      employeeId,
      username,
      idsToExclude,
    }: {
      email?: string;
      employeeId?: string;
      username?: string;
      idsToExclude?: string;
    }) {
      const query: { [key: string]: any } = {};
      let previousEntry;

      // Adding exclude operator to the query
      if (idsToExclude) {
        query._id = { $ne: idsToExclude };
      }

      // Checking if user has email
      if (email) {
        previousEntry = await withoutPermissionScope(() =>
          models.Users.findUsers({ ...query, email }),
        );

        // Checking if duplicated
        if (previousEntry.length > 0) {
          throw new Error('Duplicated email');
        }
      }

      // Checking employeeId
      if (employeeId) {
        previousEntry = await withoutPermissionScope(() =>
          models.Users.findOne({ ...query, employeeId }),
        );

        // Checking if duplicated
        if (previousEntry) {
          throw new Error('Duplicated Employee Id');
        }
      }

      //Checking username
      if (username) {
        previousEntry = await withoutPermissionScope(() =>
          models.Users.findOne({ ...query, username }),
        );

        // Checking if duplicated
        if (previousEntry) {
          throw new Error('Username already exists');
        }
      }
    }

    public static getSecret() {
      return process.env.JWT_TOKEN_SECRET || 'SECRET';
    }

    /**
     * Create new user
     */
    public static async createUser({
      username,
      email,
      password,
      details,
      links,
      groupIds,
      isActive,
      isOwner = false,
      notUsePassword = false,
    }: IUser & { notUsePassword?: boolean; links: ILink[] }) {
      // empty string password validation

      if (password === '' && !notUsePassword) {
        throw new Error('Password can not be empty');
      }

      // Checking duplicated email
      await models.Users.checkDuplication({ email });

      if (!notUsePassword) {
        this.checkPassword(password);
      }

      const user = await models.Users.create({
        isOwner,
        username,
        email,
        details,
        links,
        groupIds,
        isActive: isActive !== undefined ? isActive : true,
        // hash password
        password: notUsePassword ? '' : await this.generatePassword(password),
        code: await this.generateUserCode(),
      });
      sendDbEventLog({
        action: 'create',
        docId: user._id,
        currentDocument: user.toObject(),
      });

      return user;
    }

    /**
     * Update user information
     */
    public static async updateUser(_id: string, doc: IUpdateUser) {
      const user = await models.Users.getUser(_id);

      if (!user) {
        throw new Error('User not found');
      }

      doc.password = (doc.password ?? '').trim();
      doc.email = (doc.email ?? '').toLowerCase().trim();

      if (doc.email) {
        // Checking duplicated email
        await this.checkDuplication({ email: doc.email, idsToExclude: _id });
      } else {
        delete doc.email;
      }

      // change password
      if (doc.password) {
        this.checkPassword(doc.password);

        doc.password = await this.generatePassword(doc.password);

        // if there is no password specified then leaveErxesGateway password field alone
      } else {
        delete doc.password;
      }

      if (doc.employeeId) {
        // Checking employeeId duplication
        await this.checkDuplication({
          employeeId: doc.employeeId,
          idsToExclude: _id,
        });
      }

      if (doc.propertiesData) {
        const propertiesData = await models.Fields.validateFieldValues(
          await models.Fields.keepFeaturedValues(
            doc.propertiesData,
            user.propertiesData,
          ),
        );

        doc.propertiesData = propertiesData;
      }

      const operations: any = { $set: doc };

      if (['', undefined, null].includes(doc.employeeId)) {
        delete operations.$set.employeeId;
        operations.$unset = { employeeId: 1 };
      }

      if (doc.username) {
        await this.checkDuplication({
          username: doc.username,
          idsToExclude: _id,
        });
      }

      await models.Users.updateOne({ _id }, operations);

      const updatedUser = await models.Users.findOne({ _id });
      if (updatedUser) {
        sendDbEventLog({
          action: 'update',
          docId: updatedUser._id,
          currentDocument: updatedUser.toObject(),
          prevDocument: user.toObject(),
        });

        // Generate activity logs for changed activity fields
        generateUserUpdateActivityLogs(
          { models, subdomain },
          user,
          updatedUser,
          createActivityLog,
        );
      }
      return updatedUser;
    }

    public static async generateToken(duration?: number) {
      const buffer = await crypto.randomBytes(20);
      const token = buffer.toString('hex');

      const expires = Date.now() + (duration || 86400000);

      return {
        token,
        expires,
      };
    }

    /**
     * Create new user with invitation token
     */
    public static async invite({ email, password }: IInviteParams) {
      email = (email || '').toLowerCase().trim();
      password = (password || '').trim();

      // Checking duplicated email
      await models.Users.checkDuplication({ email });

      const { token, expires } = await models.Users.generateToken(1800000); // 30 minutes

      if (password) {
        this.checkPassword(password);
      }

      const user = await models.Users.create({
        email,
        isActive: true,
        registrationToken: token,
        registrationTokenExpires: expires,
        code: await this.generateUserCode(),
        ...(password && { password: await this.generatePassword(password) }),
      });

      sendDbEventLog({
        action: 'create',
        docId: user._id,
        currentDocument: user.toObject(),
      });

      createActivityLog(generateUserInvitationActivityLog(user));

      return token;
    }

    /**
     * Resend invitation
     */
    public static async resendInvitation({ email }: { email: string }) {
      const user = await models.Users.findOne({ email });

      if (!user) {
        throw new Error('User not found');
      }

      if (!user.registrationToken) {
        throw new Error('Invalid request');
      }

      const { token, expires } = await models.Users.generateToken(1800000); // 30 minutes

      await models.Users.updateOne(
        { email },
        {
          registrationToken: token,
          registrationTokenExpires: expires,
        },
      );

      createActivityLog(generateUserInvitationActivityLog(user));

      return token;
    }

    /*
     * Update user profile
     */
    public static async editProfile(
      _id: string,
      { username, email, details, links, employeeId }: IEditProfile,
    ) {
      const user = await models.Users.getUser(_id);

      // Checking duplicated email
      await this.checkDuplication({ email, idsToExclude: _id });

      if (employeeId) {
        // Checking employeeId duplication
        await this.checkDuplication({
          employeeId,
          idsToExclude: _id,
        });
      }

      await models.Users.updateOne(
        { _id },
        { $set: { username, email, details, links, employeeId } },
      );

      const updatedUser = await models.Users.findOne({ _id });
      if (updatedUser) {
        sendDbEventLog({
          action: 'update',
          docId: updatedUser._id,
          currentDocument: updatedUser.toObject(),
          prevDocument: user.toObject(),
        });

        await generateUserUpdateActivityLogs(
          { models, subdomain },
          user,
          updatedUser,

          createActivityLog,
        );
      }
      return updatedUser;
    }

    /*
     * Update email signatures
     */
    public static async configEmailSignatures(
      _id: string,
      signatures: IEmailSignature[],
    ) {
      await models.Users.updateOne(
        { _id },
        { $set: { emailSignatures: signatures } },
      );

      return models.Users.findOne({ _id });
    }

    /*
     * Config get notifications by emmail
     */
    public static async configGetNotificationByEmail(
      _id: string,
      isAllowed: boolean,
    ) {
      await models.Users.updateOne(
        { _id },
        { $set: { getNotificationByEmail: isAllowed } },
      );

      return models.Users.findOne({ _id });
    }

    /*
     * Remove user
     */
    public static async setUserActiveOrInactive(_id: string) {
      const user = await models.Users.findOne({ _id });

      if (!user) {
        throw new Error('User not found');
      }

      if (user.isActive === false) {
        await models.Users.updateOne({ _id }, { $set: { isActive: true } });

        const updatedUser = await models.Users.findOne({ _id });
        if (updatedUser) {
          sendDbEventLog({
            action: 'update',
            docId: updatedUser._id,
            currentDocument: updatedUser.toObject(),
            prevDocument: user.toObject(),
          });
          await generateUserUpdateActivityLogs(
            { models, subdomain },
            user,
            updatedUser,
            createActivityLog,
          );
        }
        return updatedUser;
      } else {
        await models.Users.updateOne({ _id }, { $set: { isActive: false } });

        const updatedUser = await models.Users.findOne({ _id });
        if (updatedUser) {
          sendDbEventLog({
            action: 'update',
            docId: updatedUser._id,
            currentDocument: updatedUser.toObject(),
            prevDocument: user.toObject(),
          });
          await generateUserUpdateActivityLogs(
            { models, subdomain },
            user,
            updatedUser,
            createActivityLog,
          );
        }
        return updatedUser;
      }
    }

    /*
     * Generates new password hash using plan text password
     */
    public static generatePassword(password: string) {
      const hashPassword = crypto
        .createHash('sha256')
        .update(password)
        .digest('hex');

      return bcrypt.hash(hashPassword, SALT_WORK_FACTOR);
    }

    /*
      Compare password
    */
    public static async comparePassword(
      password: string,
      userPassword: string,
    ) {
      const hashPassword = crypto
        .createHash('sha256')
        .update(password)
        .digest('hex');

      return bcrypt.compare(hashPassword, userPassword);
    }

    /*
     * Resets user password by given token & password
     */
    public static async resetPassword({
      token,
      newPassword,
    }: {
      token: string;
      newPassword: string;
    }) {
      // find user by token
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
      await models.Users.findByIdAndUpdate(
        { _id: user._id },
        {
          password: await this.generatePassword(newPassword),
          resetPasswordToken: undefined,
          resetPasswordExpires: undefined,
        },
      );

      return models.Users.findOne({ _id: user._id });
    }

    /**
     * Reset member's password by given _id & newPassword
     */
    public static async resetMemberPassword({
      _id,
      newPassword,
    }: {
      _id: string;
      newPassword: string;
    }) {
      const user = await models.Users.getUser(_id);

      if (!newPassword) {
        throw new Error('Password is required.');
      }

      this.checkPassword(newPassword);

      await models.Users.updateOne(
        { _id },
        { $set: { password: await this.generatePassword(newPassword) } },
      );

      return models.Users.findOne({ _id: user._id });
    }

    /*
     * Change user password
     */
    public static async changePassword({
      _id,
      currentPassword,
      newPassword,
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

      const user = await models.Users.getUser(_id);

      // check current password ============
      const valid = await this.comparePassword(currentPassword, user.password);

      if (!valid) {
        throw new Error('Incorrect current password');
      }

      // set new password
      await models.Users.findByIdAndUpdate(
        { _id: user._id },
        {
          password: await this.generatePassword(newPassword),
        },
      );

      return models.Users.findOne({ _id: user._id });
    }

    /*
     * Sends reset password link to found user's email
     */
    public static async forgotPassword(email: string) {
      // find user
      const user = await models.Users.findOne({
        email: (email || '').toLowerCase().trim(),
      });

      if (!user) {
        throw new Error('Invalid email');
      }

      // create the random token
      const buffer = await crypto.randomBytes(20);
      const token = buffer.toString('hex');

      // save token & expiration date
      await models.Users.findByIdAndUpdate(
        { _id: user._id },
        {
          resetPasswordToken: token,
          resetPasswordExpires: Date.now() + 86400000,
        },
      );

      return token;
    }

    public static async getTokenFields(_user: IUserDocument) {
      const user = {
        _id: _user._id,
        email: _user.email,
        details: _user.details,
        isOwner: _user.isOwner,
        groupIds: _user.groupIds,
        brandIds: _user.brandIds,
        username: _user.username,
        code: _user.code,
      };

      return user;
    }

    /*
     * Creates regular and refresh tokens using given user information
     */
    public static async createTokens(_user: IUserDocument, secret: string) {
      const user = {
        _id: _user._id,
        isOwner: _user.isOwner,
      };

      const createToken = await jwt.sign({ user }, secret, { expiresIn: '1d' });

      const createRefreshToken = await jwt.sign({ user }, secret, {
        expiresIn: '7d',
      });

      return [createToken, createRefreshToken];
    }

    /*
     * Renews tokens
     */
    public static async refreshTokens(refreshToken: string) {
      let _id = '';

      try {
        // validate refresh token
        const { user }: any = jwt.verify(refreshToken, this.getSecret());

        _id = user._id;
        // if refresh token is expired then force to login
      } catch (e: any) {
        return {};
      }

      const dbUser = await models.Users.findOne({ _id, isActive: true });

      if (!dbUser) {
        return {};
      }

      // recreate tokens
      const [newToken, newRefreshToken] = await this.createTokens(
        dbUser,
        this.getSecret(),
      );

      if (newToken) {
        await saveValidatedToken(newToken, dbUser);
      }

      return {
        token: newToken,
        refreshToken: newRefreshToken,
        user: dbUser,
      };
    }

    /*
     * Validates user credentials and generates tokens
     */
    public static async login({
      email,
      password,
      deviceToken,
    }: {
      email: string;
      password: string;
      deviceToken?: string;
    }) {
      email = (email || '').toLowerCase().trim();

      const loginPattern = new RegExp(`^${escapeRegExp(email)}$`, 'i');

      const user = await models.Users.findOne({
        $or: [
          { email: { $regex: loginPattern } },
          { username: { $regex: loginPattern } },
        ],
        isActive: true,
      });

      if (!user?.password) {
        // user with provided email not found
        throw new Error('Invalid login');
      }
      const valid = await this.comparePassword(password, user.password);

      if (!valid) {
        // bad password
        throw new Error('Invalid login');
      }
      // create tokens
      const [token, refreshToken] = await this.createTokens(
        user,
        this.getSecret(),
      );

      if (token) {
        await saveValidatedToken(token, user);
      }

      // storing tokens in user collection.
      if (deviceToken) {
        const deviceTokens: string[] = user.deviceTokens || [];

        if (!deviceTokens.includes(deviceToken)) {
          deviceTokens.push(deviceToken);

          await user.updateOne({ $set: { deviceTokens } });
        }
      }

      await sendOnboardNotification(subdomain, models, user._id);
      await user.updateOne({ $set: { registrationToken: null } });

      const loginActivityLog = generateLoginActivityLog(user, {
        method: 'email/password',
        deviceToken,
      });
      createActivityLog(loginActivityLog, user._id);

      return {
        token,
        refreshToken,
      };
    }

    /**
     * Logging out user from database
     */
    public static async logout(user: IUserDocument, currentToken: string) {
      const validatedToken = await redis.get(
        `user_token_${user._id}_${currentToken}`,
      );

      if (validatedToken) {
        await redis.del(`user_token_${user._id}_${currentToken}`);

        await models.Users.updateOne(
          { _id: user._id },
          { $set: { lastSeenAt: new Date() } },
        );

        const logoutActivityLog = generateLogoutActivityLog(user);
        createActivityLog(logoutActivityLog);

        return 'loggedout';
      }

      return 'token not found';
    }

    public static async generateUserCodeField() {
      const users = await models.Users.find({ code: { $exists: false } });

      if (users.length === 0) {
        return;
      }

      const doc: Array<{
        updateOne: {
          filter: { _id: string };
          update: { $set: { code: string } };
        };
      }> = [];

      let code = Number.parseInt((await this.generateUserCode()) || '', 10);

      for (const user of users) {
        code++;

        doc.push({
          updateOne: {
            filter: { _id: user._id },
            update: { $set: { code: this.getCodeString(code) } },
          },
        });
      }

      return models.Users.bulkWrite(doc);
    }

    public static async generateUserCode() {
      const users = await withoutPermissionScope(() =>
        models.Users.find({ code: { $exists: true } })
          .sort({ code: -1 })
          .limit(1),
      );

      if (users.length === 0) {
        return '000';
      }

      const [user] = users;

      let code = Number.parseInt(user.code || '', 10);

      code++;

      return this.getCodeString(code);
    }

    public static getCodeString(code: number) {
      return ('00' + code).slice(-3);
    }

    public static findUsers(query: any, options?: any) {
      const filter = { ...query, role: { $ne: USER_ROLES.SYSTEM } };

      try {
        models.Users.find(filter, options).lean();
      } catch (e) {
        console.error(e);
      }

      return models.Users.find(filter, options).lean();
    }

    public static async checkLoginAuth({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) {
      const user = await models.Users.findOne({
        $or: [
          { email: { $regex: new RegExp(`^${email}$`, 'i') } },
          { username: { $regex: new RegExp(`^${email}$`, 'i') } },
        ],
        isActive: true,
      });

      if (!user?.password) {
        // user with provided email not found
        throw new Error('Invalid login');
      }

      const valid = await this.comparePassword(password, user.password);

      if (!valid) {
        // bad password
        throw new Error('Invalid login');
      }

      return user;
    }
    public static async setChatStatus(_id: string, status: string) {
      const user = await models.Users.findOne({ _id });
      if (!user) {
        throw new Error('User not found');
      }
      await models.Users.updateOne({ _id }, { $set: { chatStatus: status } });
      const updatedUser = await models.Users.findOne({ _id });
      if (updatedUser) {
        sendDbEventLog({
          action: 'update',
          docId: updatedUser._id,
          currentDocument: updatedUser.toObject(),
          prevDocument: user.toObject(),
        });
        await generateUserUpdateActivityLogs(
          { models, subdomain },
          user,
          updatedUser,
          createActivityLog,
        );
      }
      return updatedUser;
    }
  }

  userSchema.loadClass(User);

  return userSchema;
};
