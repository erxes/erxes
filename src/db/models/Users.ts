import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { Model, model } from 'mongoose';
import * as sha256 from 'sha256';
import { IDetail, IEmailSignature, ILink, IUser, IUserDocument, userSchema } from './definitions/users';

const SALT_WORK_FACTOR = 10;

interface IEditProfile {
  username?: string;
  email?: string;
  details?: IDetail;
  links?: ILink;
}

interface IUpdateUser extends IEditProfile {
  role?: string;
  password?: string;
}

interface IUserModel extends Model<IUserDocument> {
  checkDuplication(email?: string, idsToExclude?: string | string[]): never;
  getSecret(): string;

  createUser(doc: IUser): Promise<IUserDocument>;

  updateUser(_id: string, doc: IUpdateUser): Promise<IUserDocument>;

  editProfile(_id: string, doc: IEditProfile): Promise<IUserDocument>;

  configEmailSignatures(_id: string, signatures: IEmailSignature[]): Promise<IUserDocument>;

  configGetNotificationByEmail(_id: string, isAllowed: boolean): Promise<IUserDocument>;

  removeUser(_id: string): Promise<IUserDocument>;
  generatePassword(password: string): string;
  comparePassword(password: string, userPassword: string): boolean;

  resetPassword({ token, newPassword }: { token: string; newPassword: string }): Promise<IUserDocument>;

  changePassword({
    _id,
    currentPassword,
    newPassword,
  }: {
    _id: string;
    currentPassword: string;
    newPassword: string;
  }): Promise<IUserDocument>;

  forgotPassword(email: string): string;
  createTokens(_user: IUserDocument, secret: string): string[];

  refreshTokens(refreshToken: string): { token: string; refreshToken: string; user: IUserDocument };

  login({ email, password }: { email: string; password?: string }): { token: string; refreshToken: string };
}

class User {
  /**
   * Checking if user has duplicated properties
   */
  public static async checkDuplication(email?: string, idsToExclude?: string | string[]) {
    const query: { [key: string]: any } = {};
    let previousEntry;

    // Adding exclude operator to the query
    if (idsToExclude) {
      query._id = idsToExclude instanceof Array ? { $nin: idsToExclude } : { $ne: idsToExclude };
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
    return 'dfjklsafjjekjtejifjidfjsfd';
  }

  /**
   * Create new user
   */
  public static async createUser({ username, email, password, role, details, links }: IUser) {
    // empty string password validation
    if (password === '') {
      throw new Error('Password can not be empty');
    }

    // Checking duplicated email
    await Users.checkDuplication(email);

    return Users.create({
      username,
      email,
      role,
      details,
      links,
      isActive: true,
      // hash password
      password: await this.generatePassword(password),
    });
  }

  /**
   * Update user information
   */
  public static async updateUser(_id: string, { username, email, password, role, details, links }: IUpdateUser) {
    const doc = { username, email, password, role, details, links };

    // Checking duplicated email
    await this.checkDuplication(email, _id);

    // change password
    if (password) {
      doc.password = await this.generatePassword(password);

      // if there is no password specified then leave password field alone
    } else {
      delete doc.password;
    }

    await Users.update({ _id }, { $set: doc });

    return Users.findOne({ _id });
  }

  /*
   * Update user profile
   */
  public static async editProfile(_id: string, { username, email, details, links }: IEditProfile) {
    // Checking duplicated email
    await this.checkDuplication(email, _id);

    await Users.update({ _id }, { $set: { username, email, details, links } });

    return Users.findOne({ _id });
  }

  /*
   * Update email signatures
   */
  public static async configEmailSignatures(_id: string, signatures: IEmailSignature[]) {
    await Users.update({ _id }, { $set: { emailSignatures: signatures } });

    return Users.findOne({ _id });
  }

  /*
   * Config get notifications by emmail
   */
  public static async configGetNotificationByEmail(_id: string, isAllowed: boolean) {
    await Users.update({ _id }, { $set: { getNotificationByEmail: isAllowed } });

    return Users.findOne({ _id });
  }

  /*
   * Remove user
   */
  public static async removeUser(_id: string) {
    await Users.update({ _id }, { $set: { isActive: false } });

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
  public static async resetPassword({ token, newPassword }: { token: string; newPassword: string }) {
    // find user by token
    const user = await Users.findOne({
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

    // set new password
    await Users.findByIdAndUpdate(
      { _id: user._id },
      {
        password: await this.generatePassword(newPassword),
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined,
      },
    );

    return Users.findOne({ _id: user._id });
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

    const user = await Users.findOne({ _id });

    if (!user) {
      throw new Error('User not found');
    }

    // check current password ============
    const valid = await this.comparePassword(currentPassword, user.password);

    if (!valid) {
      throw new Error('Incorrect current password');
    }

    // set new password
    await Users.findByIdAndUpdate(
      { _id: user._id },
      {
        password: await this.generatePassword(newPassword),
      },
    );

    return Users.findOne({ _id: user._id });
  }

  /*
   * Sends reset password link to found user's email
   */
  public static async forgotPassword(email: string) {
    // find user
    const user = await Users.findOne({ email });

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
        resetPasswordExpires: Date.now() + 86400000,
      },
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
      role: _user.role,
      isOwner: _user.isOwner,
    };

    const createToken = await jwt.sign({ user }, secret, { expiresIn: '20m' });

    const createRefreshToken = await jwt.sign({ user }, secret, {
      expiresIn: '7d',
    });

    return [createToken, createRefreshToken];
  }

  /*
   * Renews tokens
   */
  public static async refreshTokens(refreshToken: string) {
    let _id = null;

    try {
      // validate refresh token
      const { user } = jwt.verify(refreshToken, this.getSecret());

      _id = user._id;

      // if refresh token is expired then force to login
    } catch (e) {
      return {};
    }

    const dbUser = await Users.findOne({ _id });

    if (!dbUser) {
      throw new Error('User not found');
    }

    // recreate tokens
    const [newToken, newRefreshToken] = await this.createTokens(dbUser, this.getSecret());

    return {
      token: newToken,
      refreshToken: newRefreshToken,
      user: dbUser,
    };
  }

  /*
   * Validates user credentials and generates tokens
   */
  public static async login({ email, password }: { email: string; password: string }) {
    const user = await Users.findOne({
      $or: [{ email: { $regex: new RegExp(email, 'i') } }, { username: { $regex: new RegExp(email, 'i') } }],
    });

    if (!user) {
      // user with provided email not found
      throw new Error('Invalid login');
    }

    const valid = await this.comparePassword(password, user.password);

    if (!valid) {
      // bad password
      throw new Error('Invalid login');
    }

    // create tokens
    const [token, refreshToken] = await this.createTokens(user, this.getSecret());

    return {
      token,
      refreshToken,
    };
  }
}

userSchema.loadClass(User);

const Users = model<IUserDocument, IUserModel>('users', userSchema);

export default Users;
