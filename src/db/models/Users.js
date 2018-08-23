import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import sha256 from 'sha256';
import jwt from 'jsonwebtoken';
import { ROLES } from '../../data/constants';
import { field } from './utils';

const SALT_WORK_FACTOR = 10;

const EmailSignatureSchema = mongoose.Schema(
  {
    brandId: field({ type: String }),
    signature: field({ type: String }),
  },
  { _id: false },
);

// Detail schema
const DetailSchema = mongoose.Schema(
  {
    avatar: field({ type: String }),
    fullName: field({ type: String }),
    position: field({ type: String }),
    location: field({ type: String, optional: true }),
    description: field({ type: String, optional: true }),
  },
  { _id: false },
);

const LinkSchema = mongoose.Schema(
  {
    linkedIn: field({ type: String, optional: true }),
    twitter: field({ type: String, optional: true }),
    facebook: field({ type: String, optional: true }),
    github: field({ type: String, optional: true }),
    youtube: field({ type: String, optional: true }),
    website: field({ type: String, optional: true }),
  },
  { _id: false },
);

// User schema
const UserSchema = mongoose.Schema({
  _id: field({ pkey: true }),
  username: field({ type: String }),
  password: field({ type: String }),
  resetPasswordToken: field({ type: String }),
  resetPasswordExpires: field({ type: Date }),
  role: field({
    type: String,
    enum: [ROLES.ADMIN, ROLES.CONTRIBUTOR],
  }),
  isOwner: field({ type: Boolean }),
  isActive: field({ type: Boolean, default: true }),
  email: field({
    type: String,
    lowercase: true,
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
  }),
  getNotificationByEmail: field({ type: Boolean }),
  emailSignatures: field({ type: [EmailSignatureSchema] }),
  starredConversationIds: field({ type: [String] }),
  details: field({ type: DetailSchema }),
  links: field({ type: LinkSchema, default: {} }),
});

class User {
  /**
   * Checking if user has duplicated properties
   * @param  {Object} userFields - User fields to check duplications
   * @param  {String[]} idsToExclude - User ids to exclude
   * @return {Promise} - Result
   */
  static async checkDuplication(userFields, idsToExclude) {
    const query = {};
    let previousEntry = null;

    // Adding exclude operator to the query
    if (idsToExclude) {
      if (idsToExclude instanceof Array) {
        query._id = { $nin: idsToExclude };
      } else {
        query._id = { $ne: idsToExclude };
      }
    }

    // Checking if user has email
    if (userFields.email) {
      previousEntry = await this.find({ ...query, email: userFields.email });

      // Checking if duplicated
      if (previousEntry.length > 0) {
        throw new Error('Duplicated email');
      }
    }
  }

  static getSecret() {
    return 'dfjklsafjjekjtejifjidfjsfd';
  }

  /**
   * Create new user
   * @param {Object} doc - user fields
   * @return {Promise} newly created user object
   */
  static async createUser({ username, email, password, role, details, links }) {
    // empty string password validation
    if (password === '') {
      throw new Error('Password can not be empty');
    }

    // Checking duplicated email
    await this.checkDuplication({ email });

    return this.create({
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
   * @param {String} userId
   * @param {Object} doc - user fields
   * @return {Promise} updated user info
   */
  static async updateUser(_id, { username, email, password, role, details, links }) {
    const doc = { username, email, password, role, details, links };

    // Checking duplicated email
    await this.checkDuplication({ email }, _id);

    // change password
    if (password) {
      doc.password = await this.generatePassword(password);

      // if there is no password specified then leave password field alone
    } else {
      delete doc.password;
    }

    await this.update({ _id }, { $set: doc });

    return this.findOne({ _id });
  }

  /*
   * Update user profile
   * @param {String} _id - User id
   * @param {Object} doc - User profile information
   * @return {Promise} - Updated user
   */
  static async editProfile(_id, { username, email, details, links }) {
    // Checking duplicated email
    await this.checkDuplication({ email }, _id);

    await this.update({ _id }, { $set: { username, email, details, links } });

    return this.findOne({ _id });
  }

  /*
   * Update email signatures
   * @param {String} _id - User id
   * @param {[Object]} signatures - Email signatures
   * @return {Promise} - Updated user
   */
  static async configEmailSignatures(_id, signatures) {
    await this.update({ _id }, { $set: { emailSignatures: signatures } });

    return this.findOne({ _id });
  }

  /*
   * Config get notifications by emmail
   * @param {String} _id - User id
   * @param {[Object]} isAllowed - is allowed
   * @return {Promise} - Updated user
   */
  static async configGetNotificationByEmail(_id, isAllowed) {
    await this.update({ _id }, { $set: { getNotificationByEmail: isAllowed } });

    return this.findOne({ _id });
  }

  /*
   * Remove user
   * @param {String} _id - User id
   * @return {Promise} - remove method response
   */
  static async removeUser(_id) {
    await this.update({ _id }, { $set: { isActive: false } });

    return this.findOne({ _id });
  }

  /*
   * Generates new password hash using plan text password
   * @param {String} password - Plan text password
   * @return hashed password
   */
  static generatePassword(password) {
    const hashPassword = sha256(password);

    return bcrypt.hash(hashPassword, SALT_WORK_FACTOR);
  }

  /*
    Compare password
    @param {String} password
    @param {String} userPassword - Current password
    return {Boolean} is valid
  */
  static comparePassword(password, userPassword) {
    const hashPassword = sha256(password);

    return bcrypt.compare(hashPassword, userPassword);
  }

  /*
   * Resets user password by given token & password
   * @param {String} token - User's temporary token for reset password
   * @param {String} newPassword - New password
   * @return {Promise} - Updated user information
   */
  static async resetPassword({ token, newPassword }) {
    // find user by token
    const user = await this.findOne({
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
    await this.findByIdAndUpdate(
      { _id: user._id },
      {
        password: await this.generatePassword(newPassword),
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined,
      },
    );

    return this.findOne({ _id: user._id });
  }

  /*
   * Change user password
   * @param {String} currentPassword - Current password
   * @param {String} newPassword - New password
   * @return {Promise} - Updated user information
   */
  static async changePassword({ _id, currentPassword, newPassword }) {
    // Password can not be empty string
    if (newPassword === '') {
      throw new Error('Password can not be empty');
    }

    const user = await this.findOne({ _id });

    // check current password ============
    const valid = await this.comparePassword(currentPassword, user.password);

    if (!valid) {
      throw new Error('Incorrect current password');
    }

    // set new password
    await this.findByIdAndUpdate(
      { _id: user._id },
      {
        password: await this.generatePassword(newPassword),
      },
    );

    return this.findOne({ _id: user._id });
  }

  /*
   * Sends reset password link to found user's email
   * @param {String} email - Registered user's email
   * @return {String} - Generated token
   */
  static async forgotPassword(email) {
    // find user
    const user = await this.findOne({ email });

    if (!user) {
      throw new Error('Invalid email');
    }

    // create the random token
    const buffer = await crypto.randomBytes(20);
    const token = buffer.toString('hex');

    // save token & expiration date
    await this.findByIdAndUpdate(
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
   * @param {Object} _user - User object
   * @param {String} secret - Token secret
   * @return [String] - list of tokens
   */
  static async createTokens(_user, secret) {
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
   * @param {String} refreshToken
   * @return {Object} renewed tokens with user
   */
  static async refreshTokens(refreshToken) {
    let _id = null;

    try {
      // validate refresh token
      const { user } = jwt.verify(refreshToken, this.getSecret());

      _id = user._id;

      // if refresh token is expired then force to login
    } catch (e) {
      return {};
    }

    const user = await Users.findOne({ _id });

    // recreate tokens
    const [newToken, newRefreshToken] = await this.createTokens(user, this.getSecret());

    return {
      token: newToken,
      refreshToken: newRefreshToken,
      user,
    };
  }

  /*
   * Validates user credentials and generates tokens
   * @param {Object} args
   * @param {String} args.email - User email
   * @param {String} args.password - User password
   * @return {Object} - generated tokens
   */
  static async login({ email, password }) {
    const user = await Users.findOne({
      $or: [
        { email: { $regex: new RegExp(email, 'i') } },
        { username: { $regex: new RegExp(email, 'i') } },
      ],
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

UserSchema.loadClass(User);

const Users = mongoose.model('users', UserSchema);

export default Users;
