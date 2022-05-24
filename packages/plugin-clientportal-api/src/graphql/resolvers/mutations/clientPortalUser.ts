import { authCookieOptions } from '../../../auth/authUtils';
import { IContext } from '../../../connectionResolver';
import { sendCoreMessage } from '../../../messageBroker';
import { ILoginParams } from '../../../models/ClientPortalUser';
import { IUser } from '../../../models/definitions/clientPortalUser';
import { sendSms } from '../../../utils';

export interface IVerificationParams {
  userId: string;
  emailOtp?: string;
  phoneOtp?: string;
}

const clientPortalUserMutations = {
  clientPortalRegister: async (_root, args: IUser, context: IContext) => {
    const { cpModels, models, subdomain } = context;
    const config = await models.ClientPortals.getConfig(args.clientPortalId);

    return cpModels.ClientPortalUsers.createUser(subdomain, args, config);
  },

  clientPortalVerifyOTP: async (
    _root,
    args: IVerificationParams,
    context: IContext
  ) => {
    const { cpModels } = context;

    return cpModels.ClientPortalUsers.verifyUser(args);
  },

  /*
   * Login
   */
  clientPortalLogin: async (_root, args: ILoginParams, context: IContext) => {
    const { token } = await context.cpModels.ClientPortalUsers.login(args);
    const cookieOptions: any = { secure: context.requestInfo.secure };
    context.res.cookie(
      'client-auth-token',
      token,
      authCookieOptions(cookieOptions)
    );

    return 'loggedin';
  },

  /*
   * Logout
   */
  async clientPortalLogout(_root, _args, { res }: IContext) {
    res.cookie('client-auth-token', '1', { maxAge: 0 });

    return 'loggedout';
  },

  /*
   * Change user password
   */
  clientPortalUserChangePassword(
    _root,
    args: { currentPassword: string; newPassword: string },
    { user, cpModels }: IContext
  ) {
    return cpModels.ClientPortalUsers.changePassword({
      _id: user._id,
      ...args
    });
  },

  /*
   * Change user password
   */
  clientPortalResetPasswordWithCode(
    _root,
    args: { phone: string; password: string; code: string },
    { cpModels }: IContext
  ) {
    return cpModels.ClientPortalUsers.changePasswordWithCode(args);
  },

  async clientPortalForgotPassword(
    _root,
    args: { clientPortalId: string; phone: string; email: string },
    { cpModels, models, subdomain }: IContext
  ) {
    const { clientPortalId, phone, email } = args;
    const query: any = { clientPortalId };

    if (email) {
      query.email = email;
    }

    if (phone) {
      query.phone = phone;
    }

    const {
      token,
      phoneCode
    } = await cpModels.ClientPortalUsers.forgotPassword(
      clientPortalId,
      phone,
      email
    );

    const clientPortal = await models.ClientPortals.getConfig(clientPortalId);

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
        smsTransporterType: ''
      };
      const body =
        config.content.replace(/{.*}/, phoneCode) ||
        `Your verification code is ${phoneCode}`;

      await sendSms(subdomain, config.smsTransporterType, phone, body);
    }

    return 'sent';
  }
};

export default clientPortalUserMutations;
