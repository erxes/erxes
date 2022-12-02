import { authCookieOptions, getEnv } from '@erxes/api-utils/src/core';

import { createJwtToken } from '../../../auth/authUtils';
import { IContext } from '../../../connectionResolver';
import { sendCoreMessage } from '../../../messageBroker';
import { ILoginParams } from '../../../models/ClientPortalUser';
import { IUser } from '../../../models/definitions/clientPortalUser';
import { sendSms } from '../../../utils';

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
    { models }: IContext
  ) {
    const user = await models.ClientPortalUsers.confirmInvitation({
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
    { models }: IContext
  ) {
    const updated = await models.ClientPortalUsers.updateUser(_id, doc);

    return updated;
  },

  /**
   * Removes a clientPortal User
   * @param {string} param1._id clientPortal User id
   */
  async clientPortalUsersRemove(
    _root,
    { clientPortalUserIds }: { clientPortalUserIds: string[] },
    { models }: IContext
  ) {
    const response = await models.ClientPortalUsers.removeUser(
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
    const { models } = context;

    return models.ClientPortalUsers.verifyUsers(userIds, type);
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
    cpUser;
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

    const { userId, phoneCode } = await models.ClientPortalUsers.loginWithPhone(
      clientPortal,
      phone
    );

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

    return { userId, message: 'Sms sent' };
  }
};

export default clientPortalUserMutations;
