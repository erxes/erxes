import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { Model, model } from 'mongoose';
import * as sha256 from 'sha256';
import { UsersGroups } from '.';
import { ILink } from './definitions/common';
import {
  IDetail,
  IEmailSignature,
  IUser,
  IUserDocument,
  userSchema
} from './definitions/users';

const SALT_WORK_FACTOR = 10;

interface IEditProfile {
  username?: string;
  email?: string;
  details?: IDetail;
  links?: ILink;
}

interface IUpdateUser extends IEditProfile {
  password?: string;
  groupIds?: string[];
  brandIds?: string[];
}

export interface IUserModel extends Model<IUserDocument> {
  getUser(_id: string): Promise<IUserDocument>;
  checkPassword(password: string): void;
  checkDuplication({
    email,
    idsToExclude,
    emails
  }: {
    email?: string;
    idsToExclude?: string | string[];
    emails?: string[];
  }): never;
  getSecret(): string;
  generateToken(): { token: string; expires: Date };
  createUser(doc: IUser): Promise<IUserDocument>;
  updateUser(_id: string, doc: IUpdateUser): Promise<IUserDocument>;
  editProfile(_id: string, doc: IEditProfile): Promise<IUserDocument>;
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
  invite({
    email,
    password,
    groupId
  }: {
    email: string;
    password: string;
    groupId: string;
  }): string;
  resendInvitation({ email }: { email: string }): string;
  confirmInvitation({
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
  }): Promise<IUserDocument>;
  comparePassword(password: string, userPassword: string): boolean;
  resetPassword({
    token,
    newPassword
  }: {
    token: string;
    newPassword: string;
  }): Promise<IUserDocument>;
  resetMemberPassword({
    _id,
    newPassword
  }: {
    _id: string;
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
  login({
    email,
    password,
    deviceToken
  }: {
    email: string;
    password?: string;
    deviceToken?: string;
  }): { token: string; refreshToken: string };
}

export const loadClass = () => {
  class User {
    public static async getUser(_id: string) {
      const user = await Users.findOne({ _id });

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
      idsToExclude
    }: {
      email?: string;
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
        previousEntry = await Users.find({ ...query, email });

        // Checking if duplicated
        if (previousEntry.length > 0) {
          throw new Error('Duplicated email');
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
      isOwner = false
    }: IUser) {
      // empty string password validation
      if (password === '') {
        throw new Error('Password can not be empty');
      }

      // Checking duplicated email
      await Users.checkDuplication({ email });

      this.checkPassword(password);

      return Users.create({
        isOwner,
        username,
        email,
        details,
        links,
        groupIds,
        isActive: true,
        // hash password
        password: await this.generatePassword(password)
      });
    }

    /**
     * Update user information
     */
    public static async updateUser(
      _id: string,
      {
        username,
        email,
        password,
        details,
        links,
        groupIds,
        brandIds
      }: IUpdateUser
    ) {
      email = (email || '').toLowerCase().trim();
      password = (password || '').trim();

      const doc: any = {
        username,
        email,
        password,
        details,
        links,
        groupIds,
        brandIds
      };

      // Checking duplicated email
      await this.checkDuplication({ email, idsToExclude: _id });

      // change password
      if (password) {
        this.checkPassword(password);

        doc.password = await this.generatePassword(password);

        // if there is no password specified then leave password field alone
      } else {
        delete doc.password;
      }

      await Users.updateOne({ _id }, { $set: doc });

      return Users.findOne({ _id });
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
      groupId
    }: {
      email: string;
      password: string;
      groupId: string;
    }) {
      email = (email || '').toLowerCase().trim();
      password = (password || '').trim();

      // Checking duplicated email
      await Users.checkDuplication({ email });

      if (!(await UsersGroups.findOne({ _id: groupId }))) {
        throw new Error('Invalid group');
      }

      const { token, expires } = await User.generateToken();

      this.checkPassword(password);

      await Users.create({
        email,
        groupIds: [groupId],
        isActive: true,
        // hash password
        password: await this.generatePassword(password),
        registrationToken: token,
        registrationTokenExpires: expires
      });

      return token;
    }

    /**
     * Resend invitation
     */
    public static async resendInvitation({ email }: { email: string }) {
      const user = await Users.findOne({ email });

      if (!user) {
        throw new Error('User not found');
      }

      if (!user.registrationToken) {
        throw new Error('Invalid request');
      }

      const { token, expires } = await Users.generateToken();

      await Users.updateOne(
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
      const user = await Users.findOne({
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

      await Users.updateOne(
        { _id: user._id },
        {
          $set: {
            password: await this.generatePassword(password),
            isActive: true,
            registrationToken: undefined,
            username,
            details: {
              fullName
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
      { username, email, details, links }: IEditProfile
    ) {
      // Checking duplicated email
      await this.checkDuplication({ email, idsToExclude: _id });

      await Users.updateOne(
        { _id },
        { $set: { username, email, details, links } }
      );

      return Users.findOne({ _id });
    }

    /*
     * Update email signatures
     */
    public static async configEmailSignatures(
      _id: string,
      signatures: IEmailSignature[]
    ) {
      await Users.updateOne({ _id }, { $set: { emailSignatures: signatures } });

      return Users.findOne({ _id });
    }

    /*
     * Config get notifications by emmail
     */
    public static async configGetNotificationByEmail(
      _id: string,
      isAllowed: boolean
    ) {
      await Users.updateOne(
        { _id },
        { $set: { getNotificationByEmail: isAllowed } }
      );

      return Users.findOne({ _id });
    }

    /*
     * Remove user
     */
    public static async setUserActiveOrInactive(_id: string) {
      const user = await Users.findOne({ _id });

      if (!user) {
        throw new Error('User not found');
      }

      if (user.isActive === false) {
        await Users.updateOne({ _id }, { $set: { isActive: true } });

        return Users.findOne({ _id });
      }

      if (user.isOwner) {
        throw new Error('Can not deactivate owner');
      }

      await Users.updateOne({ _id }, { $set: { isActive: false } });

      return Users.findOne({ _id });
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
      const user = await Users.findOne({
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
      await Users.findByIdAndUpdate(
        { _id: user._id },
        {
          password: await this.generatePassword(newPassword),
          resetPasswordToken: undefined,
          resetPasswordExpires: undefined
        }
      );

      return Users.findOne({ _id: user._id });
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
      const user = await Users.getUser(_id);

      if (!newPassword) {
        throw new Error('Password is required.');
      }

      this.checkPassword(newPassword);

      await Users.updateOne(
        { _id },
        { $set: { password: await this.generatePassword(newPassword) } }
      );

      return Users.findOne({ _id: user._id });
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

      const user = await Users.getUser(_id);

      // check current password ============
      const valid = await this.comparePassword(currentPassword, user.password);

      if (!valid) {
        throw new Error('Incorrect current password');
      }

      // set new password
      await Users.findByIdAndUpdate(
        { _id: user._id },
        {
          password: await this.generatePassword(newPassword)
        }
      );

      return Users.findOne({ _id: user._id });
    }

    /*
     * Sends reset password link to found user's email
     */
    public static async forgotPassword(email: string) {
      // find user
      const user = await Users.findOne({
        email: (email || '').toLowerCase().trim()
      });

      if (!user) {
        throw new Error('Invalid email');
      }

      // create the random token
      const buffer = await crypto.randomBytes(20);
      const token = buffer.toString('hex');

      // save token & expiration date
      await Users.findByIdAndUpdate(
        { _id: user._id },
        {
          resetPasswordToken: token,
          resetPasswordExpires: Date.now() + 86400000
        }
      );

      return token;
    }

    /*
     * Creates regular and refresh tokens using given user information
     */
    public static async createTokens(_user: IUserDocument, secret: string) {
      const user = {
        _id: _user._id,
        email: _user.email,
        details: _user.details,
        isOwner: _user.isOwner,
        groupIds: _user.groupIds,
        brandIds: _user.brandIds,
        username: _user.username
      };

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
        const { user } = jwt.verify(refreshToken, this.getSecret());

        _id = user._id;
        // if refresh token is expired then force to login
      } catch (e) {
        return {};
      }

      const dbUser = await Users.getUser(_id);

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

      const user = await Users.findOne({
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

      if (deviceToken) {
        const deviceTokens: string[] = user.deviceTokens || [];

        if (!deviceTokens.includes(deviceToken)) {
          deviceTokens.push(deviceToken);

          await user.update({ $set: { deviceTokens } });
        }
      }

      return {
        token,
        refreshToken
      };
    }
  }

  userSchema.loadClass(User);

  return userSchema;
};

loadClass();

// tslint:disable-next-line
const Users = model<IUserDocument, IUserModel>('users', userSchema);

export default Users;
