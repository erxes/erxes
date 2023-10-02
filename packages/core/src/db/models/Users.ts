import redis from '@erxes/api-utils/src/redis';
import { ILink } from '@erxes/api-utils/src/types';
import { USER_ROLES } from '@erxes/api-utils/src/constants';

import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { Model } from 'mongoose';
import * as sha256 from 'sha256';
import { IModels } from '../../connectionResolver';
import { userActionsMap } from '@erxes/api-utils/src/core';
import { set } from '../../inmemoryStorage';
import {
  IDetail,
  IEmailSignature,
  IUser,
  IUserDocument,
  userSchema
} from './definitions/users';
import { IAppDocument } from './definitions/apps';
import { saveValidatedToken } from '../../data/utils';
import {
  IUserMovementDocument,
  userMovemmentSchema
} from './definitions/users';
import { USER_MOVEMENT_STATUSES } from '../../constants';

const SALT_WORK_FACTOR = 10;

interface IEditProfile {
  username?: string;
  email?: string;
  details?: IDetail;
  links?: ILink;
  employeeId?: string;
}

interface IUpdateUser extends IEditProfile {
  password?: string;
  groupIds?: string[];
  brandIds?: string[];
}

interface IConfirmParams {
  token: string;
  password: string;
  passwordConfirmation: string;
  fullName?: string;
  username?: string;
}

interface IInviteParams {
  email: string;
  password: string;
  groupId: string;
  brandIds: string[];
}

interface ILoginParams {
  email: string;
  password?: string;
  deviceToken?: string;
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
  }): never;
  getSecret(): string;
  generateToken(): { token: string; expires: Date };
  createUser(doc: IUser): Promise<IUserDocument>;
  updateUser(_id: string, doc: IUpdateUser): Promise<IUserDocument>;
  editProfile(_id: string, doc: IEditProfile): Promise<IUserDocument>;
  generateUserCode(): Promise<string>;
  generateUserCodeField(): Promise<void>;
  configEmailSignatures(
    _id: string,
    signatures: IEmailSignature[]
  ): Promise<IUserDocument>;
  configGetNotificationByEmail(
    _id: string,
    isAllowed: boolean
  ): Promise<IUserDocument>;
  setUserActiveOrInactive(_id: string): Promise<IUserDocument>;
  generatePassword(password: string): Promise<string>;
  invite(params: IInviteParams): string;
  resendInvitation({ email }: { email: string }): string;
  confirmInvitation(params: IConfirmParams): Promise<IUserDocument>;
  comparePassword(password: string, userPassword: string): boolean;
  resetPassword(params: {
    token: string;
    newPassword: string;
  }): Promise<IUserDocument>;
  resetMemberPassword(params: IPasswordParams): Promise<IUserDocument>;
  changePassword(
    params: IPasswordParams & { currentPassword: string }
  ): Promise<IUserDocument>;
  forgotPassword(email: string): string;
  createTokens(_user: IUserDocument, secret: string): string[];
  refreshTokens(
    refreshToken: string
  ): { token: string; refreshToken: string; user: IUserDocument };
  login(params: ILoginParams): { token: string; refreshToken: string };
  getTokenFields(user: IUserDocument);
  logout(_user: IUserDocument, token: string): string;
  createSystemUser(doc: IAppDocument): IUserDocument;
  findUsers(query: any, options?: any): Promise<IUserDocument[]>;
}

export const loadUserClass = (models: IModels) => {
  class User {
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
          'Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters'
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
      idsToExclude
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
        previousEntry = await models.Users.findUsers({ ...query, email });

        // Checking if duplicated
        if (previousEntry.length > 0) {
          throw new Error('Duplicated email');
        }
      }

      // Checking employeeId
      if (employeeId) {
        previousEntry = await models.Users.findOne({ ...query, employeeId });

        // Checking if duplicated
        if (previousEntry) {
          throw new Error('Duplicated Employee Id');
        }
      }

      //Checking username
      if (username) {
        previousEntry = await models.Users.findOne({ ...query, username });

        // Checking if duplicated
        if (previousEntry) {
          throw new Error('Duplicated User Name Id');
        }
      }
    }

    public static getSecret() {
      return process.env.JWT_TOKEN_SECRET || '';
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
      isOwner = false
    }: IUser) {
      // empty string password validation
      if (password === '') {
        throw new Error('Password can not be empty');
      }

      // Checking duplicated email
      await models.Users.checkDuplication({ email });

      this.checkPassword(password);

      return models.Users.create({
        isOwner,
        username,
        email,
        details,
        links,
        groupIds,
        isActive: isActive !== undefined ? isActive : true,
        // hash password
        password: await this.generatePassword(password),
        code: await this.generateUserCode()
      });
    }

    /**
     * Update user information
     */
    public static async updateUser(_id: string, doc: IUpdateUser) {
      doc.password = (doc.password || '').trim();
      doc.email = (doc.email || '').toLowerCase().trim();

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

        // if there is no password specified then leave password field alone
      } else {
        delete doc.password;
      }

      if (doc.employeeId) {
        // Checking employeeId duplication
        await this.checkDuplication({
          employeeId: doc.employeeId,
          idsToExclude: _id
        });
      }

      let operations: any = { $set: doc };

      if (['', undefined, null].includes(doc.employeeId)) {
        delete operations.$set.employeeId;
        operations.$unset = { employeeId: 1 };
      }

      if (doc.username) {
        await this.checkDuplication({
          username: doc.username,
          idsToExclude: _id
        });
      }

      await models.Users.updateOne({ _id }, operations);

      return models.Users.findOne({ _id });
    }

    public static async generateToken() {
      const buffer = await crypto.randomBytes(20);
      const token = buffer.toString('hex');

      return {
        token,
        expires: Date.now() + 86400000
      };
    }

    /**
     * Create new user with invitation token
     */
    public static async invite({
      email,
      password,
      groupId,
      brandIds
    }: IInviteParams) {
      email = (email || '').toLowerCase().trim();
      password = (password || '').trim();

      // Checking duplicated email
      await models.Users.checkDuplication({ email });

      if (!(await models.UsersGroups.findOne({ _id: groupId }))) {
        throw new Error('Invalid group');
      }

      const { token, expires } = await User.generateToken();

      this.checkPassword(password);

      await models.Users.create({
        email,
        groupIds: [groupId],
        isActive: true,
        // hash password
        password: await this.generatePassword(password),
        registrationToken: token,
        registrationTokenExpires: expires,
        code: await this.generateUserCode(),
        brandIds
      });

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

      const { token, expires } = await models.Users.generateToken();

      await models.Users.updateOne(
        { email },
        {
          registrationToken: token,
          registrationTokenExpires: expires
        }
      );

      return token;
    }

    /**
     * Confirms user by invitation
     */
    public static async confirmInvitation({
      token,
      password,
      passwordConfirmation,
      fullName,
      username
    }: {
      token: string;
      password: string;
      passwordConfirmation: string;
      fullName?: string;
      username?: string;
    }) {
      const user = await models.Users.findOne({
        registrationToken: token,
        registrationTokenExpires: {
          $gt: Date.now()
        }
      });

      if (!user || !token) {
        throw new Error('Token is invalid or has expired');
      }

      if (password === '') {
        throw new Error('Password can not be empty');
      }

      if (password !== passwordConfirmation) {
        throw new Error('Password does not match');
      }

      this.checkPassword(password);

      await models.Users.updateOne(
        { _id: user._id },
        {
          $set: {
            password: await this.generatePassword(password),
            isActive: true,
            registrationToken: undefined,
            username,
            details: {
              fullName,
              firstName: (fullName || '').split(' ')[0],
              lastName: (fullName || '').split(' ')[1] || ''
            }
          }
        }
      );

      return user;
    }

    /*
     * Update user profile
     */
    public static async editProfile(
      _id: string,
      { username, email, details, links, employeeId }: IEditProfile
    ) {
      // Checking duplicated email
      await this.checkDuplication({ email, idsToExclude: _id });

      if (employeeId) {
        // Checking employeeId duplication
        await this.checkDuplication({
          employeeId,
          idsToExclude: _id
        });
      }

      await models.Users.updateOne(
        { _id },
        { $set: { username, email, details, links, employeeId } }
      );

      return models.Users.findOne({ _id });
    }

    /*
     * Update email signatures
     */
    public static async configEmailSignatures(
      _id: string,
      signatures: IEmailSignature[]
    ) {
      await models.Users.updateOne(
        { _id },
        { $set: { emailSignatures: signatures } }
      );

      return models.Users.findOne({ _id });
    }

    /*
     * Config get notifications by emmail
     */
    public static async configGetNotificationByEmail(
      _id: string,
      isAllowed: boolean
    ) {
      await models.Users.updateOne(
        { _id },
        { $set: { getNotificationByEmail: isAllowed } }
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

        return models.Users.findOne({ _id });
      }

      if (user.isOwner) {
        throw new Error('Can not deactivate owner');
      }

      await models.Users.updateOne({ _id }, { $set: { isActive: false } });

      return models.Users.findOne({ _id });
    }

    /*
     * Generates new password hash using plan text password
     */
    public static generatePassword(password: string) {
      const hashPassword = sha256(password);

      return bcrypt.hash(hashPassword, SALT_WORK_FACTOR);
    }

    /*
      Compare password
    */
    public static comparePassword(password: string, userPassword: string) {
      const hashPassword = sha256(password);

      return bcrypt.compare(hashPassword, userPassword);
    }

    /*
     * Resets user password by given token & password
     */
    public static async resetPassword({
      token,
      newPassword
    }: {
      token: string;
      newPassword: string;
    }) {
      // find user by token
      const user = await models.Users.findOne({
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
      await models.Users.findByIdAndUpdate(
        { _id: user._id },
        {
          password: await this.generatePassword(newPassword),
          resetPasswordToken: undefined,
          resetPasswordExpires: undefined
        }
      );

      return models.Users.findOne({ _id: user._id });
    }

    /**
     * Reset member's password by given _id & newPassword
     */
    public static async resetMemberPassword({
      _id,
      newPassword
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
        { $set: { password: await this.generatePassword(newPassword) } }
      );

      return models.Users.findOne({ _id: user._id });
    }

    /*
     * Change user password
     */
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
          password: await this.generatePassword(newPassword)
        }
      );

      return models.Users.findOne({ _id: user._id });
    }

    /*
     * Sends reset password link to found user's email
     */
    public static async forgotPassword(email: string) {
      // find user
      const user = await models.Users.findOne({
        email: (email || '').toLowerCase().trim()
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
          resetPasswordExpires: Date.now() + 86400000
        }
      );

      return token;
    }

    public static getTokenFields(user: IUserDocument) {
      return {
        _id: user._id,
        email: user.email,
        details: user.details,
        isOwner: user.isOwner,
        groupIds: user.groupIds,
        brandIds: user.brandIds,
        username: user.username,
        code: user.code,
        departmentIds: user.departmentIds
      };
    }

    /*
     * Creates regular and refresh tokens using given user information
     */
    public static async createTokens(_user: IUserDocument, secret: string) {
      const user = this.getTokenFields(_user);

      const createToken = await jwt.sign({ user }, secret, { expiresIn: '1d' });

      const createRefreshToken = await jwt.sign({ user }, secret, {
        expiresIn: '7d'
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
      } catch (e) {
        return {};
      }

      const dbUser = await models.Users.getUser(_id);

      // recreate tokens
      const [newToken, newRefreshToken] = await this.createTokens(
        dbUser,
        this.getSecret()
      );

      return {
        token: newToken,
        refreshToken: newRefreshToken,
        user: dbUser
      };
    }

    /*
     * Validates user credentials and generates tokens
     */
    public static async login({
      email,
      password,
      deviceToken
    }: {
      email: string;
      password: string;
      deviceToken?: string;
    }) {
      email = (email || '').toLowerCase().trim();
      password = (password || '').trim();

      const user = await models.Users.findOne({
        $or: [
          { email: { $regex: new RegExp(`^${email}$`, 'i') } },
          { username: { $regex: new RegExp(`^${email}$`, 'i') } }
        ],
        isActive: true
      });

      if (!user || !user.password) {
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
        this.getSecret()
      );

      // storing tokens in user collection.
      if (token) {
        await saveValidatedToken(token, user);
      }

      if (deviceToken) {
        const deviceTokens: string[] = user.deviceTokens || [];

        if (!deviceTokens.includes(deviceToken)) {
          deviceTokens.push(deviceToken);

          await user.update({ $set: { deviceTokens } });
        }
      }

      // generate user code
      await this.generateUserCodeField();

      // put permission map in redis, so that other services can use it
      const userPermissions = await models.Permissions.find({
        userId: user._id
      });

      const groupPermissions = await models.Permissions.find({
        groupId: { $in: user.groupIds }
      });

      const actionMap = await userActionsMap(
        userPermissions,
        groupPermissions,
        user
      );

      set(`user_permissions_${user._id}`, JSON.stringify(actionMap));

      return {
        token,
        refreshToken
      };
    }

    /**
     * Logging out user from database
     */
    public static async logout(user: IUserDocument, currentToken: string) {
      const validatedToken = await redis.get(
        `user_token_${user._id}_${currentToken}`
      );

      if (validatedToken) {
        redis.del(`user_token_${user._id}_${currentToken}`);

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

      let code = parseInt((await this.generateUserCode()) || '', 10);

      for (const user of users) {
        code++;

        doc.push({
          updateOne: {
            filter: { _id: user._id },
            update: { $set: { code: this.getCodeString(code) } }
          }
        });
      }

      return models.Users.bulkWrite(doc);
    }

    public static async generateUserCode() {
      const users = await models.Users.find({ code: { $exists: true } })
        .sort({ code: -1 })
        .limit(1);

      if (users.length === 0) {
        return '000';
      }

      const [user] = users;

      let code = parseInt(user.code || '', 10);

      code++;

      return this.getCodeString(code);
    }

    public static getCodeString(code: number) {
      return ('00' + code).slice(-3);
    }

    public static async createSystemUser(app: IAppDocument) {
      const user = await models.Users.findOne({ appId: app._id });

      if (user) {
        return user;
      }

      return models.Users.create({
        role: USER_ROLES.SYSTEM,
        password: await this.generatePassword(app._id),
        username: app.name,
        code: await this.generateUserCode(),
        groupIds: [app.userGroupId],
        appId: app._id,
        isActive: true,
        email: `${app._id}@domain.com`
      });
    }

    public static findUsers(query: any, options?: any) {
      const filter = { ...query, role: { $ne: USER_ROLES.SYSTEM } };

      try {
        models.Users.find(filter, options).lean();
      } catch (e) {
        console.log(e);
      }

      return models.Users.find(filter, options).lean();
    }
  }

  userSchema.loadClass(User);

  return userSchema;
};

type ICommonUserMovement = {
  userId?: string;
  user?: IUserDocument;
  userIds?: string[];
  contentType?: string;
  contentTypeIds?: string[];
  contentTypeId?: string;
  createdBy?: string;
};

export interface IUserMovemmentModel extends Model<IUserMovementDocument> {
  manageStructureUsersMovement(
    params: ICommonUserMovement
  ): Promise<IUserMovementDocument>;
  manageUserMovement(
    params: ICommonUserMovement
  ): Promise<IUserMovementDocument>;
}

export const loadUserMovemmentClass = (models: IModels) => {
  class UserMovemment {
    public static async manageUserMovement(params: ICommonUserMovement) {
      const user = params.user as IUserDocument;

      for (const contentType of ['department', 'branch']) {
        const contentTypeIds = user[`${contentType}Ids`] || [];

        const removed = (
          await models.UserMovements.find({
            userId: user._id,
            contentType,
            contentTypeId: { $nin: contentTypeIds },
            status: USER_MOVEMENT_STATUSES.CREATED,
            isActive: true
          })
        ).map(movement => ({
          userId: user._id,
          contentType,
          contentTypeId: movement.contentTypeId,
          createdBy: user._id,
          status: USER_MOVEMENT_STATUSES.REMOVED,
          isActive: false
        }));

        if (!!removed.length) {
          await models.UserMovements.updateMany(
            {
              userId: user._id,
              contentType,
              contentTypeId: { $in: contentTypeIds },
              status: USER_MOVEMENT_STATUSES.CREATED,
              isActive: true
            },
            {
              $set: { isActive: false }
            }
          );
          await models.UserMovements.insertMany(removed);
        }

        await models.UserMovements.updateMany(
          {
            contentType,
            contentTypeId: { $in: contentTypeIds },
            userId: user._id,
            isActive: true,
            status: { $ne: USER_MOVEMENT_STATUSES.REMOVED }
          },
          { $set: { isActive: false } }
        );

        for (const contentTypeId of contentTypeIds) {
          const movement = await models.UserMovements.findOne({
            contentType,
            contentTypeId,
            userId: user._id
          }).sort({ createdAt: -1 });

          if (
            !movement ||
            movement?.status === USER_MOVEMENT_STATUSES.REMOVED
          ) {
            await models.UserMovements.create({
              contentType,
              contentTypeId,
              userId: user._id,
              createdBy: user._id,
              isActive: true
            });
          }
        }
      }
    }

    public static async manageStructureUsersMovement(
      params: ICommonUserMovement
    ) {
      const { createdBy, userIds, contentType, contentTypeId } = params;
      const fieldName = `${contentType}Ids`;
      await models.Users.updateMany(
        {
          _id: { $nin: userIds },
          [fieldName]: { $in: [contentTypeId] }
        },
        { $pull: { [fieldName]: contentTypeId } }
      );

      await models.Users.updateMany(
        { _id: { $in: userIds } },
        { $addToSet: { [fieldName]: contentTypeId } }
      );

      const userMovements = await models.UserMovements.find({
        contentType,
        contentTypeId,
        isActive: true
      });

      const removedFromContentType = userMovements
        .filter(
          movement =>
            !userIds?.some(userId => userId === movement.userId) && movement
        )
        .map(({ createdBy, contentType, contentTypeId, userId }) => ({
          createdBy,
          contentType,
          contentTypeId,
          userId,
          status: USER_MOVEMENT_STATUSES.REMOVED,
          isActive: false
        }));

      await models.UserMovements.insertMany([...removedFromContentType]);

      await models.UserMovements.updateOne(
        {
          contentType,
          contentTypeId,
          userId: { $in: userIds },
          status: { $ne: USER_MOVEMENT_STATUSES.REMOVED },
          isActive: true
        },
        { $set: { isActive: false } }
      );

      for (const userId of userIds || []) {
        const movement = await models.UserMovements.findOne({
          contentType,
          contentTypeId,
          userId
        }).sort({ createdAt: -1 });

        if (!movement || movement?.status === USER_MOVEMENT_STATUSES.REMOVED) {
          await models.UserMovements.create({
            contentType,
            contentTypeId,
            userId,
            createdBy,
            isActive: true
          });
        }
      }

      return 'edited';
    }
  }
  userMovemmentSchema.loadClass(UserMovemment);
  return userMovemmentSchema;
};
