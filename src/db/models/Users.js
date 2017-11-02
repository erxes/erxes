import mongoose from 'mongoose';
import Random from 'meteor-random';
import bcrypt from 'bcrypt';
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
    emailSignatures: [EmailSignatureSchema],
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
  details: DetailSchema,
  isOwner: Boolean,
  email: {
    type: String,
    lowercase: true,
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
  },
});

class User {
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
    await this.checkDuplications({ twitterUsername: details.twitterUsername });

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
   * @param {[Object]} signatures - Email signatures
   * @return {Promise} - Updated user
   */
  static async configEmailSignatures(_id, signatures) {
    await this.update({ _id }, { $set: { 'details.emailSignatures': signatures } });

    return this.findOne({ _id });
  }

  /*
   * Remove user
   * @param {String} _id - User id
   * @return {Promise} - remove method response
   */
  static async removeUser(_id) {
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
}

UserSchema.loadClass(User);

const Users = mongoose.model('users', UserSchema);

export default Users;
