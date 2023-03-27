import { checkPermission } from '@erxes/api-utils/src/permissions';
import { authCookieOptions, getEnv } from '@erxes/api-utils/src/core';
import { IAttachment } from '@erxes/api-utils/src/types';

import { createJwtToken } from '../../../auth/authUtils';
import { IContext } from '../../../connectionResolver';
import { sendCoreMessage } from '../../../messageBroker';
import { ILoginParams } from '../../../models/ClientPortalUser';
import { IUser } from '../../../models/definitions/clientPortalUser';
import { sendSms } from '../../../utils';
import { sendCommonMessage } from './../../../messageBroker';
import redis from '../../../redis';
import * as randomize from 'randomatic';
export interface IVerificationParams {
  userId: string;
  emailOtp?: string;
  phoneOtp?: string;
  password?: string;
}

interface IClientPortalUserEdit extends IUser {
  _id: string;
}

const clientPortalUserMutations = {
  async clientPortalConfirmInvitation(
    _root,
    {
      token,
      password,
      passwordConfirmation,
      username
    }: {
      token: string;
      password?: string;
      passwordConfirmation?: string;
      username?: string;
    },
    { models, subdomain }: IContext
  ) {
    const user = await models.ClientPortalUsers.confirmInvitation(subdomain, {
      token,
      password,
      passwordConfirmation,
      username
    });

    return user;
  },

  async clientPortalUsersEdit(
    _root,
    { _id, ...doc }: IClientPortalUserEdit,
    { models, subdomain }: IContext
  ) {
    const updated = await models.ClientPortalUsers.updateUser(
      subdomain,
      _id,
      doc
    );

    return updated;
  },

  /**
   * Removes a clientPortal User
   * @param {string} param1._id clientPortal User id
   */
  async clientPortalUsersRemove(
    _root,
    { clientPortalUserIds }: { clientPortalUserIds: string[] },
    { models, subdomain }: IContext
  ) {
    const response = await models.ClientPortalUsers.removeUser(
      subdomain,
      clientPortalUserIds
    );

    return response;
  },

  clientPortalRegister: async (_root, args: IUser, context: IContext) => {
    const { models, subdomain } = context;

    const user = await models.ClientPortalUsers.createUser(subdomain, {
      ...args
    });

    return user._id;
  },

  clientPortalVerifyOTP: async (
    _root,
    args: IVerificationParams,
    context: IContext
  ) => {
    const { models, res } = context;

    const user = await models.ClientPortalUsers.verifyUser(args);

    if (!user) {
      throw new Error('User not found');
    }

    const clientPortal = await models.ClientPortals.getConfig(
      user.clientPortalId
    );

    const optConfig = clientPortal.otpConfig;

    if (args.phoneOtp && optConfig && optConfig.loginWithOTP) {
      const cookieOptions: any = {};

      const NODE_ENV = getEnv({ name: 'NODE_ENV' });

      if (!['test', 'development'].includes(NODE_ENV)) {
        cookieOptions.sameSite = 'none';
      }

      const options = authCookieOptions(cookieOptions);
      const { token } = createJwtToken({ userId: user._id });

      res.cookie('client-auth-token', token, options);

      return 'loggedin';
    }

    return 'verified';
  },

  clientPortalUsersVerify: async (
    _root,
    { userIds, type }: { userIds: string[]; type: string },
    context: IContext
  ) => {
    const { models, subdomain } = context;

    return models.ClientPortalUsers.verifyUsers(subdomain, userIds, type);
  },

  /*
   * Login
   */
  clientPortalLogin: async (
    _root,
    args: ILoginParams,
    { models, requestInfo, res }: IContext
  ) => {
    const { token } = await models.ClientPortalUsers.login(args);

    const cookieOptions: any = {};

    const NODE_ENV = getEnv({ name: 'NODE_ENV' });

    if (!['test', 'development'].includes(NODE_ENV)) {
      cookieOptions.sameSite = 'none';
    }

    const options = authCookieOptions(cookieOptions);

    res.cookie('client-auth-token', token, options);

    return 'loggedin';
  },

  /*
   * Logout
   */
  async clientPortalLogout(
    _root,
    _args,
    { requestInfo, res, cpUser, models }: IContext
  ) {
    const NODE_ENV = getEnv({ name: 'NODE_ENV' });

    const options: any = {
      httpOnly: true
    };

    if (!['test', 'development'].includes(NODE_ENV)) {
      options.sameSite = 'none';
      options.secure = true;
    }

    if (cpUser) {
      await models.ClientPortalUsers.updateOne(
        { _id: cpUser._id || '' },
        { $set: { lastSeenAt: new Date(), isOnline: false } }
      );
    }

    res.clearCookie('client-auth-token', options);
    return 'loggedout';
  },

  /*
   * Change user password
   */
  clientPortalUserChangePassword(
    _root,
    args: { currentPassword: string; newPassword: string },
    { cpUser, models }: IContext
  ) {
    return models.ClientPortalUsers.changePassword({
      _id: (cpUser && cpUser._id) || '',
      ...args
    });
  },

  /*
   * Change user password
   */
  clientPortalResetPasswordWithCode(
    _root,
    args: { phone: string; password: string; code: string },
    { models }: IContext
  ) {
    return models.ClientPortalUsers.changePasswordWithCode(args);
  },

  clientPortalResetPassword(
    _root,
    args: { token: string; newPassword: string },
    { models }: IContext
  ) {
    return models.ClientPortalUsers.clientPortalResetPassword(args);
  },

  async clientPortalForgotPassword(
    _root,
    args: { clientPortalId: string; phone: string; email: string },
    { models, subdomain }: IContext
  ) {
    const { clientPortalId, phone, email } = args;
    const query: any = { clientPortalId };

    if (email) {
      query.email = email;
    }

    if (phone) {
      query.phone = phone;
    }

    const clientPortal = await models.ClientPortals.getConfig(clientPortalId);

    const { token, phoneCode } = await models.ClientPortalUsers.forgotPassword(
      clientPortal,
      phone,
      email
    );

    if (token) {
      const link = `${clientPortal.url}/reset-password?token=${token}`;

      await sendCoreMessage({
        subdomain,
        action: 'sendEmail',
        data: {
          toEmails: [email],
          title: 'Reset password',
          template: {
            name: 'resetPassword',
            data: {
              content: link
            }
          }
        }
      });
    }

    if (phoneCode) {
      const config = clientPortal.otpConfig || {
        content: '',
        smsTransporterType: '',
        codeLength: 4
      };
      const body =
        config.content.replace(/{.*}/, phoneCode) ||
        `Your verification code is ${phoneCode}`;

      await sendSms(subdomain, config.smsTransporterType, phone, body);
    }

    return 'sent';
  },

  clientPortalUsersInvite: async (_root, args: IUser, context: IContext) => {
    const { models, subdomain } = context;

    const user = await models.ClientPortalUsers.invite(subdomain, {
      ...args
    });

    return user;
  },

  clientPortalLoginWithPhone: async (
    _root,
    args: { phone: string; clientPortalId: string; deviceToken },
    { models, subdomain, res }: IContext
  ) => {
    const { phone, clientPortalId, deviceToken } = args;

    const clientPortal = await models.ClientPortals.getConfig(clientPortalId);

    const config = clientPortal.otpConfig || {
      content: '',
      smsTransporterType: '',
      codeLength: 4,
      loginWithOTP: false
    };

    if (!config.loginWithOTP) {
      throw new Error('Login with OTP is not enabled');
    }

    const { userId, phoneCode } = await models.ClientPortalUsers.loginWithPhone(
      subdomain,
      clientPortal,
      phone,
      deviceToken
    );

    if (phoneCode) {
      const body =
        config.content.replace(/{.*}/, phoneCode) ||
        `Your verification code is ${phoneCode}`;

      await sendSms(subdomain, config.smsTransporterType, phone, body);
    }

    return { userId, message: 'Sms sent' };
  },

  clientPortalUsersSendVerificationRequest: async (
    _root,
    args: {
      login: string;
      password: string;
      clientPortalId: string;
      attachments: IAttachment[];
      description: string;
    },
    { models, subdomain }: IContext
  ) => {
    const { login, password, clientPortalId, attachments, description } = args;

    const cpuser = await models.ClientPortalUsers.findOne({
      $or: [
        { email: { $regex: new RegExp(`^${login}$`, 'i') } },
        { username: { $regex: new RegExp(`^${login}$`, 'i') } },
        { phone: { $regex: new RegExp(`^${login}$`, 'i') } }
      ],
      clientPortalId
    });

    if (!cpuser) {
      throw new Error('User not found');
    }

    const valid = await models.ClientPortalUsers.comparePassword(
      password,
      cpuser.password || ''
    );

    if (!valid) {
      // bad password
      throw new Error('Invalid login');
    }

    if (
      cpuser.verificationRequest &&
      cpuser.verificationRequest.status === 'approved'
    ) {
      throw new Error('User already verified');
    }

    const verificationRequest = {
      attachments,
      description,
      status: 'pending'
    };

    await models.ClientPortalUsers.updateOne(
      { _id: cpuser._id },
      { $set: { verificationRequest } }
    );

    const createdBy = await sendCoreMessage({
      subdomain,
      action: 'users.findOne',
      data: { role: 'system' },
      isRPC: true,
      defaultValue: {}
    });

    const { manualVerificationConfig } = await models.ClientPortals.getConfig(
      cpuser.clientPortalId
    );

    await sendCommonMessage({
      serviceName: 'notifications',
      subdomain,
      action: 'send',
      data: {
        contentType: 'clientPortalUser',
        contentTypeId: cpuser._id,
        notifType: 'plugin',
        title: `New clientportal user verification request`,
        action: 'New clientportal user verification request',
        content: `clientportal user wants to be verified`,
        link: `/settings/client-portal/users/details/${cpuser._id}`,
        createdUser: createdBy,
        receivers:
          (manualVerificationConfig && manualVerificationConfig.userIds) || []
      }
    });

    return 'Verification request sent';
  },

  clientPortalUsersChangeVerificationStatus: async (
    _root,
    args: { userId: string; status: string },
    { models, user }: IContext
  ) => {
    if (!user) {
      throw new Error('login required');
    }

    const { userId, status } = args;

    const cpUser = await models.ClientPortalUsers.getUser({ _id: userId });

    const { manualVerificationConfig } = await models.ClientPortals.getConfig(
      cpUser.clientPortalId
    );

    if (
      !manualVerificationConfig ||
      !manualVerificationConfig.userIds.includes(user._id)
    ) {
      throw new Error('Permission denied');
    }

    const verificationRequest = cpUser.verificationRequest || {
      attachments: [],
      description: '',
      status: 'notVerified',
      verifiedBy: user._id
    };

    verificationRequest.status = status;

    await models.ClientPortalUsers.updateOne(
      { _id: userId },
      { $set: { verificationRequest } }
    );

    return 'Verification status changed';
  },

  clientPortalUsersReplacePhone: async (
    _root,
    args: { clientPortalId: string; phone: string },
    { models, subdomain, cpUser }: IContext
  ) => {
    if (!cpUser) {
      throw new Error('login required');
    }

    const { phone, clientPortalId } = args;

    const user = await models.ClientPortalUsers.findOne({
      clientPortalId,
      phone
    });

    if (user && user._id === cpUser._id) {
      throw new Error(
        'Please enter a different phone number than the current one'
      );
    }

    if (user) {
      throw new Error(
        'The phone number is already registered with another user'
      );
    }

    const cp = await models.ClientPortals.getConfig(clientPortalId);

    const config: any = cp.otpConfig || {
      content:
        'Please enter the following code to verify your phone number: {{ code }}',
      smsTransporterType: 'messagePro',
      codeLength: 4,
      loginWithOTP: false,
      expireAfter: 5
    };

    const code = randomize('0', config.codeLength);

    await redis.set(
      `cpUser:${cpUser._id}`,
      JSON.stringify({ code, phone }),
      'EX',
      60 * config.expireAfter
    );

    await sendSms(
      subdomain,
      config.smsTransporterType,
      phone,
      config.content.replace(/{.*}/, code)
    );

    return 'Confirmation code sent to your phone';
  },

  clientPortalUsersVerifyPhone: async (
    _root,
    args: { code: string },
    { models, cpUser }: IContext
  ) => {
    if (!cpUser) {
      throw new Error('login required');
    }

    const { code } = args;

    const redisObj = await redis.get(`cpUser:${cpUser._id}`);

    if (!redisObj) {
      throw new Error('Code has expired');
    }

    const { code: redisCode, phone } = JSON.parse(redisObj);

    if (redisCode !== code) {
      throw new Error('Invalid code');
    }

    await models.ClientPortalUsers.updateOne(
      { _id: cpUser._id },
      { $set: { phoneVerified: true, phone } }
    );

    return 'Phone verified';
  },

  clientPortalUpdateUser: async (
    _root,
    args: { _id: string; doc },
    { models }: IContext
  ) => {
    const { _id, doc } = args;

    return models.ClientPortalUsers.update({ _id }, { $set: doc });
  }
};

checkPermission(
  clientPortalUserMutations,
  'clientPortalUpdateUser',
  'updateUser'
);

export default clientPortalUserMutations;
