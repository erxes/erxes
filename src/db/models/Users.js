import mongoose from 'mongoose';
import Random from 'meteor-random';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { ROLES } from '../../data/constants';

const SALT_WORK_FACTOR = 10;

const EmailSignatureSchema = mongoose.Schema(
  { brandId: String, signature: String },
  { _id: false },
);

// Detail schema
const DetailSchema = mongoose.Schema(
  {
    avatar: String,
    fullName: String,
    position: String,
    twitterUsername: String,
  },
  { _id: false },
);

// User schema
const UserSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  username: String,
  password: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  role: {
    type: String,
    enum: [ROLES.ADMIN, ROLES.CONTRIBUTOR],
  },
  isOwner: Boolean,
  email: {
    type: String,
    lowercase: true,
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
  },
  getNotificationByEmail: Boolean,
  emailSignatures: [EmailSignatureSchema],
  starredConversationIds: [String],
  details: DetailSchema,
});

class User {
  static getSecret() {
    return 'dfjklsafjjekjtejifjidfjsfd';
  }

  /**
   * Create new user
   * @param {Object} doc - user fields
   * @return {Promise} newly created user object
   */
  static async createUser({ username, email, password, role, details }) {
    await this.checkDuplications({ twitterUsername: details.twitterUsername });

    return this.create({
      username,
      email,
      role,
      details,
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
  static async updateUser(_id, { username, email, password, role, details }) {
    await this.checkDuplications({
      userId: _id,
      twitterUsername: details.twitterUsername,
    });

    const doc = { username, email, password, role, details };

    // change password
    if (password) {
      doc.password = await this.generatePassword(password);
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
  static async editProfile(_id, { username, email, details }) {
    await this.update({ _id }, { $set: { username, email, details } });

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
  static removeUser(_id) {
    return Users.remove({ _id });
  }

  /*
   * Check duplications
   */
  static async checkDuplications({ userId, twitterUsername }) {
    const previousEntry = await Users.findOne({
      _id: { $ne: userId },
      'details.twitterUsername': twitterUsername,
    });

    if (previousEntry) {
      throw new Error('Duplicated twitter username');
    }
  }

  /*
   * Generates new password hash using plan text password
   * @param {String} password - Plan text password
   * @return hashed password
   */
  static generatePassword(password) {
    return bcrypt.hash(password, SALT_WORK_FACTOR);
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
        password: bcrypt.hashSync(newPassword, 10),
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined,
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
    const user = { _id: _user._id, email: _user.email, details: _user.details };

    const createToken = await jwt.sign({ user }, secret, { expiresIn: '20m' });

    const createRefreshToken = await jwt.sign({ user }, secret, { expiresIn: '7d' });

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
    const user = await Users.findOne({ email });

    if (!user) {
      // user with provided email not found
      throw new Error('Invalid login');
    }

    const valid = await bcrypt.compare(password, user.password);

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
