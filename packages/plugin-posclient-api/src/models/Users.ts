import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import * as mongoose from 'mongoose';
import { Model, model } from 'mongoose';
import * as sha256 from 'sha256';
import { ILoginParams } from '../types';
import { USER_LOGIN_TYPES } from '../util';
import { IUser, IUserDocument, userSchema } from './definitions';
import Logs from './Logs';
import { sendGraphQLRequest } from '../utils';
import {
  clientPortalCreateCustomer,
  clientPortalCreateCompany
} from '../graphql/mutations';
import * as randomize from 'randomatic';
// import messageBroker from "../messageBroker"
import { Configs } from './Configs';

const SALT_WORK_FACTOR = 10;

const configId: any = process.env.REACT_APP_CLIENT_PORTAL_CONFIG_ID;

interface IEditProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface IUserModel extends Model<IUserDocument> {
  checkPassword(password: string): void;
  getSecret(): string;
  generateToken(): { token: string; expires: Date };
  createUser(doc: IUser): Promise<IUserDocument>;
  editProfile(_id: string, doc: IEditProfile): Promise<IUserDocument>;
  generatePassword(password: string): Promise<string>;
  comparePassword(password: string, userPassword: string): boolean;
  resetPassword({
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
  forgotPassword(email: string): string;
  createTokens(_user: IUserDocument, secret: string): string[];
  refreshTokens(
    refreshToken: string
  ): { token: string; refreshToken: string; user: IUserDocument };
  login(args: ILoginParams): { token: string; refreshToken: string };
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

export const loadUserClass = models => {
  class User {
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

    public static async createUser({ password, email, ...doc }: IUser) {
      // empty string password validation
      if (password === '') {
        throw new Error('Password can not be empty');
      }

      this.checkPassword(password);

      const tEmail = (email || '').toLowerCase().trim();

      if (await models.Users.findOne({ email: tEmail })) {
        throw new Error('The user is already exists');
      }

      const performCreate = async () => {
        return models.Users.create({
          ...doc,
          email: tEmail,
          // hash password
          password: await this.generatePassword(password)
        });
      };

      const { companyName, firstName, lastName, type, phone } = doc;

      if (type === USER_LOGIN_TYPES.COMPANY) {
        const company: any = await sendGraphQLRequest({
          query: clientPortalCreateCompany,
          name: 'clientPortalCreateCompany',
          variables: {
            configId,
            email: tEmail,
            companyName
          }
        });

        if (company && company._id) {
          const user = await performCreate();

          await models.Users.updateOne(
            { _id: user._id },
            { $set: { erxesCompanyId: company._id } }
          );

          return user._id;
        }

        return;
      }

      let customer: any;

      const config = await Configs.findOne();

      if (config) {
        // const response = await messageBroker().sendRPCMessage(
        //   "erxes-pos-to-api",
        //   {
        //     action: "newCustomer",
        //     posToken: config.token,
        //     data: {
        //       firstName,
        //       lastName,
        //       emailValidationStatus: "valid",
        //       phoneValidationStatus: "valid",
        //       primaryEmail: tEmail,
        //       primaryPhone: phone,
        //       state: "customer",
        //     },
        //   }
        // );
        // if (response && response._id) {
        //   customer = await models.Customers.createCustomer(response);
        // }
      }

      if (!customer) {
        customer = await sendGraphQLRequest({
          query: clientPortalCreateCustomer,
          name: 'clientPortalCreateCustomer',
          variables: {
            configId,
            email: tEmail,
            firstName,
            lastName
          }
        });
      }

      if (customer && customer._id) {
        const user = await performCreate();

        await models.Users.updateOne(
          { _id: user._id },
          { $set: { erxesCustomerId: customer._id } }
        );

        return user._id;
      }
    }

    public static async editProfile(_id: string, { password, ...doc }: IUser) {
      const user = await models.Users.findOne({ _id }).lean();

      if (!user) {
        throw new Error('User not found');
      }

      // check current password ============
      const valid = await this.comparePassword(password, user.password);

      if (!valid) {
        throw new Error('Incorrect current password');
      }

      const email = doc.email;

      // Checking duplicated email
      const exisitingUser = await models.Users.findOne({ email }).lean();

      if (exisitingUser) {
        throw new Error('Email duplicated');
      }

      await models.Users.updateOne({ _id }, { $set: doc });

      return models.Users.findOne({ _id });
    }

    public static async resetPassword({
      token,
      newPassword
    }: {
      token: string;
      newPassword: string;
    }) {
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

      const user = await models.Users.findOne({ _id }).lean();

      if (!user) {
        throw new Error('User not found');
      }

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

    public static async forgotPassword(email: string) {
      const user = await models.Users.findOne({ email });

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

    public static async changePasswordWithCode({
      phone,
      code,
      password
    }: {
      phone: string;
      code: string;
      password: string;
    }) {
      const user = await models.Users.findOne({
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
      await models.Users.findByIdAndUpdate(
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
        lastName: _user.lastName,
        erxesCustomerId: _user.erxesCustomerId,
        erxesCompanyId: _user.erxesCompanyId
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

      const dbUsers = await Users.findOne({ _id });

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
      const user = await Users.findOne({ phone });
      const code = this.generateVerificationCode();
      const codeExpires = Date.now() + 60000;

      if (!user) {
        throw new Error('User not found');
      }

      await models.Users.updateOne(
        { _id: user._id },
        {
          $set: {
            verificationCode: code,
            verificationCodeExpires: codeExpires
          }
        }
      );

      return code;
    }

    public static async login({
      type,
      email,
      password,
      description,
      deviceToken
    }: ILoginParams) {
      const user = await models.Users.findOne({
        $or: [
          { email: { $regex: new RegExp(`^${email}$`, 'i') } },
          { phone: { $regex: new RegExp(`^${email}$`, 'i') } }
        ],
        type: type || { $ne: USER_LOGIN_TYPES.COMPANY }
      });

      if (!user || !user.password) {
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

      await Logs.createLog({
        type: 'user',
        typeId: user._id,
        text: 'login',
        description
      });

      return {
        token,
        refreshToken
      };
    }
  }

  userSchema.loadClass(User);

  return userSchema;
};

// tslint:disable-next-line
delete mongoose.connection.models['users'];

// tslint:disable-next-line
const Users = model<IUserDocument, IUserModel>('users', userSchema);

export default Users;
