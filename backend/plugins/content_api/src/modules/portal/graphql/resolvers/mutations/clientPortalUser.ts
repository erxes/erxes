import * as jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

import { IContext } from '~/connectionResolvers';
import { IInvitiation, ITwoFactorDevice, IUser } from '@/portal/@types/user';
import { ILoginParams } from '@/portal/db/models/Users';
import {
  authCookieOptions,
  getEnv,
  redis,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { IAttachment } from 'erxes-api-shared/core-types';
import { random } from 'erxes-api-shared/utils';
import { checkPermission } from 'erxes-api-shared/core-modules';
import { fetchUserFromToki, tokenHandler } from '@/portal/utils/auth';
import { fetchUserFromSocialpay } from '@/portal/utils/socialpay';
import { sendSms } from '@/portal/utils/common';

export interface IVerificationParams {
  userId: string;
  emailOtp?: string;
  phoneOtp?: string;
  password?: string;
  twoFactor?: ITwoFactorDevice;
}

interface IGoogleOauthToken {
  access_token: string;
  id_token: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
  scope: string;
}

interface IGoogleUserResult {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

export const clientPortalUserMutations = {
  async clientPortalConfirmInvitation(
    _root,
    {
      token,
      password,
      passwordConfirmation,
      username,
    }: {
      token: string;
      password?: string;
      passwordConfirmation?: string;
      username?: string;
    },
    { models }: IContext,
  ) {
    const user = await models.Users.confirmInvitation({
      token,
      password,
      passwordConfirmation,
      username,
    });

    return user;
  },

  async clientPortalUsersEdit(_root, args: any, { models }: IContext) {
    const {_id, doc} = args;
    return  models.Users.updateUser(_id, doc);
  },

  /**
   * Removes a clientPortal User
   * @param {string} param1._id clientPortal User id
   */
  async clientPortalUsersRemove(
    _root,
    { clientPortalUserIds }: { clientPortalUserIds: string[] },
    { models }: IContext,
  ) {
    const response = await models.Users.removeUser(clientPortalUserIds);

    return response;
  },

  clientPortalRegister: async (_root, args: IUser, context: IContext) => {
    const { models } = context;

    const user = await models.Users.createUser({
      ...args,
    });

    return user._id;
  },

  clientPortalVerifyOTP: async (
    _root,
    args: IVerificationParams,
    context: IContext,
  ) => {
    const { models, res } = context;

    const user = await models.Users.verifyUser(args);

    if (!user) {
      throw new Error('User not found');
    }

    const clientPortal = await models.Portals.getConfig(user.clientPortalId);

    const optConfig = clientPortal.otpConfig;

    if (optConfig && optConfig.loginWithOTP) {
      return tokenHandler(user, clientPortal, res, false);
    }

    return 'verified';
  },

  clientPortalUsersVerify: async (
    _root,
    { userIds, type }: { userIds: string[]; type: string },
    context: IContext,
  ) => {
    const { models } = context;

    return models.Users.verifyUsers(userIds, type);
  },

  /*
   * Login
   */
  clientPortalLogin: async (
    _root,
    args: ILoginParams,
    { models, res }: IContext,
  ) => {
    const { user, portal, isPassed2FA } = await models.Users.login(args);

    return tokenHandler(
      user,
      portal,
      res,
      portal.twoFactorConfig?.enableTwoFactor,
      isPassed2FA,
    );
  },

  clientPortalFacebookAuthentication: async (
    _root,
    args: any,
    { models, res }: IContext,
  ) => {
    const { clientPortalId, accessToken } = args;

    try {
      const response = await fetch(
        'https://graph.facebook.com/v12.0/me?' +
          new URLSearchParams({
            access_token: accessToken,
            fields:
              'id,name,email,gender,education,work,picture,last_name,first_name',
          }),
      ).then((r) => r.json());

      if (!response || !response.id) {
        throw new Error('Facebook authentication failed');
      }

      const { id, name, email, picture, first_name, last_name } =
        response || {};

      let qry: any = {};
      let user: any = {};

      const trimmedMail = (email || '').toLowerCase().trim();

      if (email) {
        qry = { email: trimmedMail };
      }

      qry.clientPortalId = clientPortalId;

      // let customer = await sendCoreMessage({
      //   action: 'customers.findOne',
      //   data: {
      //     customerPrimaryEmail: email,
      //   },
      //   isRPC: true,
      // });

      let customer = await sendTRPCMessage({
        pluginName: 'core',
        method: 'query',
        module: 'customers',
        action: 'findOne',
        input: {
          primaryEmail: email,
        },
      });

      if (customer) {
        qry = { erxesCustomerId: customer._id, clientPortalId };
      }

      user = await models.Users.findOne(qry);

      if (!user) {
        user = await models.Users.create({
          facebookId: id,
          email,
          logo: picture?.data?.url,
          username: name,
          firstName: first_name,
          lastName: last_name,
          clientPortalId,
          isEmailVerified: email ? true : false,
        });
      }

      if (!customer) {
        customer = await sendTRPCMessage({
          pluginName: 'core',
          method: 'mutation',
          module: 'customers',
          action: 'createCustomer',
          input: {
            firstName: first_name,
            lastName: last_name,
            primaryEmail: trimmedMail,
            state: 'lead',
            avatar: picture?.data?.url,
            emailValidationStatus: email && 'valid',
          },
        });
      }

      if (customer && customer._id) {
        user.erxesCustomerId = customer._id;
        await models.Users.updateOne(
          { _id: user._id },
          { $set: { erxesCustomerId: customer._id } },
        );
      }

      const portal = await models.Portals.getConfig(user.clientPortalId);

      return tokenHandler(user, portal, res, false);
    } catch (e) {
      throw new Error(e.message);
    }
  },

  clientPortalGoogleAuthentication: async (
    _root,
    args: any,
    { models, res }: IContext,
  ) => {
    const { clientPortalId, code } = args;

    const portal = await models.Portals.getConfig(clientPortalId);

    if (!code) {
      throw new Error('Authorization code not provided!');
    }

    const getGoogleOauthToken = async ({
      authCode,
    }: {
      authCode: string;
    }): Promise<IGoogleOauthToken> => {
      try {
        const authResponse = await fetch(
          'https://oauth2.googleapis.com/token?' +
            new URLSearchParams({
              code: authCode,
              client_id: portal.googleClientId || '',
              grant_type: 'authorization_code',
              client_secret: portal.googleClientSecret || '',
              redirect_uri: portal.googleRedirectUri || '',
            }),
          {
            method: 'POST',
          },
        ).then((r) => r.json());

        if (authResponse.error) {
          throw new Error(authResponse.error.message);
        }

        return authResponse;
      } catch (err) {
        throw new Error(err);
      }
    };

    async function getGoogleUser({
      id_token,
      access_token,
    }: {
      id_token: string;
      access_token: string;
    }): Promise<IGoogleUserResult> {
      try {
        const userResponse = await fetch(
          'https://www.googleapis.com/oauth2/v1/userinfo?' +
            new URLSearchParams({
              alt: 'json',
              access_token,
            }),
          {
            headers: {
              Authorization: `Bearer ${id_token}`,
            },
          },
        ).then((r) => r.json());

        if (userResponse.error) {
          throw new Error(userResponse.error.message);
        }

        return userResponse;
      } catch (err) {
        throw Error(err);
      }
    }

    // Use the code to get the id and access tokens
    const response = await getGoogleOauthToken({ authCode: code });

    // Use the token to get the User
    const { name, email, picture, id, family_name, given_name } =
      await getGoogleUser({
        id_token: response.id_token,
        access_token: response.access_token,
      });
    let qry: any = {};
    let user: any = {};

    const trimmedMail = (email || '').toLowerCase().trim();

    if (email) {
      qry = { email: trimmedMail };
    }

    qry.clientPortalId = clientPortalId;

    // let customer = await sendCoreMessage({
    //   action: 'customers.findOne',
    //   data: {
    //     customerPrimaryEmail: email,
    //   },
    //   isRPC: true,
    // });

    let customer = await sendTRPCMessage({
      pluginName: 'core',
      method: 'query',
      module: 'customers',
      action: 'findOne',
      input: {
        primaryEmail: email,
      },
    });

    if (customer) {
      qry = { erxesCustomerId: customer._id, clientPortalId };
    }
    if (id) {
      qry = { googleId: id };
    }

    user = await models.Users.findOne(qry);

    if (!user) {
      user = await models.Users.create({
        googleId: id,
        email,
        avatar: picture,
        username: email,
        lastName: family_name,
        firstName: given_name,
        isEmailVerified: true,
        clientPortalId,
      });
    } else {
      user.avatar = picture;
      user.lastName = family_name;
      user.firstName = given_name;
      await models.Users.updateOne(
        { _id: user._id },
        {
          $set: {
            avatar: picture,
            lastName: family_name,
            firstName: given_name,
            isEmailVerified: true,
          },
        },
      );
    }

    if (!customer) {
      customer = await sendTRPCMessage({
        pluginName: 'core',
        method: 'mutation',
        module: 'customers',
        action: 'createCustomer',
        input: {
          firstName: given_name,
          lastName: family_name,
          primaryEmail: trimmedMail,
          state: 'lead',
          avatar: picture,
          emailValidationStatus: 'valid',
        },
      });
    }

    if (customer && customer._id) {
      user.erxesCustomerId = customer._id;
      await models.Users.updateOne(
        { _id: user._id },
        { $set: { erxesCustomerId: customer._id } },
      );
    }

    const clientPortal = await models.Portals.getConfig(user.clientPortalId);

    return tokenHandler(user, clientPortal, res, false);
  },

  /*
   * Logout
   */
  async clientPortalLogout(
    _root,
    _args,
    { res, portalUser, models }: IContext,
  ) {
    const NODE_ENV = getEnv({ name: 'NODE_ENV' });

    const options: any = {
      httpOnly: true,
    };

    if (!['test', 'development'].includes(NODE_ENV)) {
      options.sameSite = 'none';
      options.secure = true;
    }

    if (portalUser) {
      await models.Users.updateOne(
        { _id: portalUser._id || '' },
        { $set: { lastSeenAt: new Date(), isOnline: false } },
      );
    }

    res.clearCookie('client-auth-token', options);
    return 'loggedout';
  },

  /*
   * Change user password
   */
  async clientPortalUserChangePassword(
    _root,
    args: { currentPassword: string; newPassword: string },
    { portalUser, models }: IContext,
  ) {
    return models.Users.changePassword({
      _id: (portalUser && portalUser._id) || '',
      ...args,
    });
  },

  /*
   * Change user password
   */
  async clientPortalResetPasswordWithCode(
    _root,
    args: {
      phone: string;
      password: string;
      code: string;
      isSecondary: boolean;
    },
    { models }: IContext,
  ) {
    return models.Users.changePasswordWithCode(args);
  },

  async clientPortalResetPassword(
    _root,
    args: { token: string; newPassword: string },
    { models }: IContext,
  ) {
    return models.Users.clientPortalResetPassword(args);
  },

  async clientPortalForgotPassword(
    _root,
    args: {
      clientPortalId: string;
      phone: string;
      email: string;
      isSecondary: boolean;
    },
    { models }: IContext,
  ) {
    const { clientPortalId, phone, email, isSecondary = false } = args;
    const query: any = { clientPortalId };

    if (!phone && !email) {
      throw new Error('Phone or email is required');
    }

    if (email) {
      query.email = email;
    }

    if (phone) {
      query.phone = phone;
    }

    const clientPortal = await models.Portals.getConfig(clientPortalId);

    const { token, phoneCode } = await models.Users.forgotPassword(
      clientPortal,
      phone,
      email,
    );

    const passwordVerificationConfig =
      clientPortal.passwordVerificationConfig || {
        verifyByOTP: false,
        smsContent: `Reset password link: ${clientPortal.url}/reset-password?token=${token}`,
        emailSubject: 'Reset password',
        emailContent: `Reset password link: ${clientPortal.url}/reset-password?token=${token}`,
      };

    const verifyByLink = !passwordVerificationConfig.verifyByOTP;

    const config = clientPortal.otpConfig || {
      content: '',
      smsTransporterType: 'messagepro',
      codeLength: 4,
    };

    if (phone) {
      const smsContent = verifyByLink
        ? passwordVerificationConfig.smsContent.replace(
            /{{ link }}/,
            `${clientPortal.url}/reset-password?token=${token}`,
          )
        : passwordVerificationConfig.smsContent.replace(/{.*}/, phoneCode);

      await sendSms(config.smsTransporterType, phone, smsContent);

      return 'sent';
    }

    const emailContent = verifyByLink
      ? passwordVerificationConfig.emailContent.replace(
          /{{ link }}/,
          `${clientPortal.url}/reset-password?token=${token}`,
        )
      : passwordVerificationConfig.emailContent.replace(/{.*}/, phoneCode);

    await sendTRPCMessage({
      pluginName: 'core',
      method: 'mutation',
      module: 'core',
      action: 'sendEmail',
      input: {
        toEmails: [email],
        title: passwordVerificationConfig.emailSubject,
        template: {
          name: 'base',
          data: {
            content: emailContent,
          },
        },
      },
    });

    return 'sent';
  },

  UsersInvite: async (_root, args: IInvitiation, context: IContext) => {
    const { models } = context;

    const user = await models.Users.invite({
      ...args,
    });

    if (args.erxesCompanyId) {
      await models.Companies.createOrUpdateCompany({
        erxesCompanyId: args.erxesCompanyId,
        clientPortalId: args.clientPortalId,
      });
    }

    return user;
  },

  clientPortalLoginWithPhone: async (
    _root,
    args: { phone: string; clientPortalId: string; deviceToken },
    { models }: IContext,
  ) => {
    const { phone, clientPortalId, deviceToken } = args;

    const clientPortal = await models.Portals.getConfig(clientPortalId);

    const config = clientPortal.otpConfig || {
      content: '',
      smsTransporterType: '',
      codeLength: 4,
      loginWithOTP: false,
      expireAfter: 5,
    };

    if (!config.loginWithOTP) {
      throw new Error('Login with OTP is not enabled');
    }

    const doc = { phone };

    const user = await models.Users.loginWithoutPassword(
      clientPortal,
      doc,
      deviceToken,
    );

    try {
      if (clientPortal?.testUserPhone && clientPortal._id) {
        const portalUser = await models.Users.findOne({
          firstName: 'test clientportal user',
          clientPortalId: clientPortal._id,
        });

        if (portalUser) {
          if (!clientPortal?.testUserOTP) {
            throw new Error('Test user phone otp not provided!');
          }

          if (
            config.codeLength !== clientPortal?.testUserOTP?.toString().length
          ) {
            throw new Error(
              'Client portal otp config and test user otp does not same length!',
            );
          }

          if (
            clientPortal?.testUserOTP &&
            config.codeLength === clientPortal?.testUserOTP?.toString().length
          ) {
            const testPhoneCode = await models.Users.imposeVerificationCode({
              clientPortalId: clientPortal._id,
              codeLength: config.codeLength,
              phone: clientPortal?.testUserPhone,
              expireAfter: config.expireAfter,
              testUserOTP: clientPortal?.testUserOTP,
            });

            const body =
              config.content.replace(/{.*}/, testPhoneCode) ||
              `Your verification code is ${testPhoneCode}`;

            await sendSms(
              config.smsTransporterType
                ? config.smsTransporterType
                : 'messagePro',
              clientPortal?.testUserPhone,
              body,
            );
          }

          return { userId: user._id, message: 'Sms sent' };
        }
      }
    } catch (e) {
      console.error(e.message);
    }

    const phoneCode = await models.Users.imposeVerificationCode({
      clientPortalId: clientPortal._id,
      codeLength: config.codeLength,
      phone: user.phone,
      expireAfter: config.expireAfter,
    });

    if (phoneCode) {
      const body =
        config.content.replace(/{.*}/, phoneCode) ||
        `Your verification code is ${phoneCode}`;

      await sendSms(
        config.smsTransporterType ? config.smsTransporterType : 'messagePro',
        phone,
        body,
      );
    }

    return { userId: user._id, message: 'Sms sent' };
  },

  clientPortal2FAGetCode: async (
    _root,
    args: {
      byPhone: boolean;
      byEmail: boolean;
      deviceToken?: string;
    },
    { models, portalUser }: IContext,
  ) => {
    if (!portalUser) {
      throw new Error('User is not logged in');
    }
    const { byPhone, byEmail, deviceToken } = args;

    const clientPortal = await models.Portals.getConfig(
      portalUser.clientPortalId,
    );

    const config = clientPortal.twoFactorConfig || {
      content: '',
      smsTransporterType: '',
      codeLength: 4,
      enableTwoFactor: false,
      expireAfter: 5,
    };

    if (!config.enableTwoFactor) {
      throw new Error('Login with 2FA is not enabled');
    }

    const doc = { phone: portalUser.phone, email: portalUser.email };

    try {
      if (clientPortal?.testUserPhone && clientPortal._id) {
        const portalUser = await models.Users.findOne({
          firstName: 'test clientportal user',
          clientPortalId: clientPortal._id,
        });

        if (portalUser) {
          if (!clientPortal?.testUserOTP) {
            throw new Error('Test user phone otp not provided!');
          }

          if (
            config.codeLength !== clientPortal?.testUserOTP?.toString().length
          ) {
            throw new Error(
              'Client portal otp config and test user otp does not same length!',
            );
          }

          if (
            clientPortal?.testUserOTP &&
            config.codeLength === clientPortal?.testUserOTP?.toString().length
          ) {
            const testPhoneCode = await models.Users.imposeVerificationCode({
              clientPortalId: clientPortal._id,
              codeLength: config.codeLength,
              phone: clientPortal?.testUserPhone,
              expireAfter: config.expireAfter,
              testUserOTP: clientPortal?.testUserOTP,
            });

            const body =
              config.content.replace(/{.*}/, testPhoneCode) ||
              `Your verification code is ${testPhoneCode}`;

            await sendSms(
              config.smsTransporterType
                ? config.smsTransporterType
                : 'messagePro',
              clientPortal?.testUserPhone,
              body,
            );
          }

          return { userId: portalUser._id, message: 'Sms sent' };
        }
      }
    } catch (e) {
      console.error(e.message);
    }
    if (byPhone) {
      if (!portalUser.phone) {
        throw new Error("User doesn't have phone");
      }
      const phoneCode = await models.Users.imposeVerificationCode({
        clientPortalId: clientPortal._id,
        codeLength: config.codeLength,
        phone: portalUser.phone,
        expireAfter: config.expireAfter,
      });

      if (phoneCode) {
        const body =
          config.content.replace(/{.*}/, phoneCode) ||
          `Your verification code is ${phoneCode}`;

        await sendSms(
          config.smsTransporterType ? config.smsTransporterType : 'messagePro',
          portalUser.phone,
          body,
        );
      }
      return { userId: portalUser._id, message: 'Sms sent' };
    }

    if (portalUser.email && byEmail) {
      if (!portalUser.email) {
        throw new Error("User doesn't have email");
      }
      const emailCode = await models.Users.imposeVerificationCode({
        clientPortalId: clientPortal._id,
        codeLength: config.codeLength,
        email: portalUser.email,
        expireAfter: config.expireAfter,
      });

      if (emailCode) {
        const body =
          config.content.replace(/{.*}/, emailCode) ||
          `Your OTP is ${emailCode}`;

        await sendTRPCMessage({
          pluginName: 'core',
          method: 'mutation',
          module: 'core',
          action: 'sendEmail',
          input: {
            toEmails: [portalUser.email],
            title: config.emailSubject || 'OTP verification',
            template: {
              name: 'base',
              data: {
                content: body,
              },
            },
          },
        });
      }
      return { userId: portalUser._id, message: 'Sent' };
    }
  },

  clientPortalVerify2FA: async (
    _root,
    args: { emailOtp?: string; phoneOtp?: string; twoFactor: ITwoFactorDevice },
    context: IContext,
  ) => {
    const { models, res, portalUser } = context;
    if (!portalUser) {
      throw new Error('User is not logged in');
    }

    if (!args.twoFactor) {
      throw new Error('Provide Two Factor Params.');
    }

    const clientPortal = await models.Portals.getConfig(
      portalUser.clientPortalId,
    );

    const twoFactorConfig = clientPortal.twoFactorConfig;
    const user = await models.Users.verifyUser({
      emailOtp: args.emailOtp,
      phoneOtp: args.phoneOtp,
      twoFactor: args.twoFactor,
      userId: portalUser.id,
    });

    if (twoFactorConfig && twoFactorConfig.enableTwoFactor) {
      const twoFactorDevices: ITwoFactorDevice[] =
        portalUser.twoFactorDevices || [];
      if (!twoFactorDevices.includes(args.twoFactor)) {
        twoFactorDevices.push(args.twoFactor);
        await portalUser.updateOne({ $set: { twoFactorDevices } });
      }

      return tokenHandler(
        portalUser,
        clientPortal,
        res,
        twoFactorConfig.enableTwoFactor,
        true,
      );
    }

    return '2Factor not enabled';
  },

  clientPortal2FADeleteKey: async (
    _root,
    args: { key: string },
    context: IContext,
  ) => {
    const { models, res, portalUser } = context;
    if (!portalUser) {
      throw new Error('User is not logged in');
    }

    const pull = await models.Users.updateOne(
      { _id: portalUser.id },
      { $pull: { twoFactorDevices: { key: args.key } } },
    );

    return 'success';
  },
  clientPortalLoginWithMailOTP: async (
    _root,
    args: { email: string; clientPortalId: string; deviceToken },
    { models, res }: IContext,
  ) => {
    const { email, clientPortalId, deviceToken } = args;
    const clientPortal = await models.Portals.getConfig(clientPortalId);

    const config = clientPortal.otpConfig || {
      content: '',
      codeLength: 4,
      loginWithOTP: false,
      expireAfter: 5,
      emailSubject: 'Email verification',
    };

    if (!config.loginWithOTP) {
      throw new Error('Login with OTP is not enabled');
    }

    const doc = { email };

    const user = await models.Users.loginWithoutPassword(
      clientPortal,
      doc,
      deviceToken,
    );

    try {
      if (clientPortal?.testUserEmail && clientPortal._id) {
        const portalUser = await models.Users.findOne({
          firstName: 'test clientportal user',
          clientPortalId: clientPortal._id,
        });
        if (portalUser) {
          if (!clientPortal?.testUserOTP) {
            throw new Error('Test user email otp not provided!');
          }

          if (
            config.codeLength !== clientPortal?.testUserOTP?.toString().length
          ) {
            throw new Error(
              'Client portal otp config and test user otp does not same length!',
            );
          }

          if (
            clientPortal?.testUserOTP &&
            config.codeLength === clientPortal?.testUserOTP?.toString().length
          ) {
            const testEmailCode = await models.Users.imposeVerificationCode({
              clientPortalId: clientPortal._id,
              codeLength: config.codeLength,
              email: clientPortal?.testUserEmail,
              expireAfter: config.expireAfter,
              testUserOTP: clientPortal?.testUserOTP,
            });

            const body =
              config.content.replace(/{.*}/, testEmailCode) ||
              `Your OTP is ${testEmailCode}`;

            await sendTRPCMessage({
              pluginName: 'core',
              method: 'mutation',
              module: 'core',
              action: 'sendEmail',
              input: {
                toEmails: [email],
                title: config.emailSubject || 'OTP verification',
                template: {
                  name: 'base',
                  data: {
                    content: body,
                  },
                },
              },
            });
          }

          return { userId: user._id, message: 'sent' };
        }
      }
    } catch (e) {
      console.error(e.message);
    }

    const emailCode = await models.Users.imposeVerificationCode({
      clientPortalId: clientPortal._id,
      codeLength: config.codeLength,
      email: user.email,
      expireAfter: config.expireAfter,
    });

    if (emailCode) {
      const body =
        config.content.replace(/{.*}/, emailCode) || `Your OTP is ${emailCode}`;

      await sendTRPCMessage({
        pluginName: 'core',
        method: 'mutation',
        module: 'core',
        action: 'sendEmail',
        input: {
          toEmails: [email],
          title: config.emailSubject || 'OTP verification',
          template: {
            name: 'base',
            data: {
              content: body,
            },
          },
        },
      });
    }

    return { userId: user._id, message: 'Sent' };
  },

  clientPortalLoginWithSocialPay: async (
    _root,
    args: { token: string; clientPortalId: string },
    { models, res }: IContext,
  ) => {
    const { token, clientPortalId } = args;

    const clientPortal = await models.Portals.getConfig(clientPortalId);

    const data = await fetchUserFromSocialpay(token, clientPortal);
    const { individualId, mobileNumber, email, firstName, lastName, imgUrl } =
      data;

    const doc = {
      firstName,
      lastName,
      phone: mobileNumber,
      email,
      code: individualId,
      avatar: imgUrl,
    };

    const user = await models.Users.loginWithoutPassword(clientPortal, doc);

    return tokenHandler(user, clientPortal, res, false);
  },

  clientPortalLoginWithToki: async (
    _root,
    args: { token: string; clientPortalId: string },
    { models, res }: IContext,
  ) => {
    const { token, clientPortalId } = args;

    const clientPortal = await models.Portals.getConfig(clientPortalId);

    const response = await fetchUserFromToki(token, clientPortal);
    const { _id, phoneNo, profilePicURL, name } = response.data;

    const [firstName = '', lastName = ''] = name.trim().split(' ');

    const mobileNumber = phoneNo;
    const imgUrl = profilePicURL;

    const doc = {
      firstName,
      lastName,
      phone: mobileNumber,
      code: _id,
      avatar: `https://ms-public-toki.mn/profile/${imgUrl}`, //imgUrl,
    };

    const user = await models.Users.loginWithoutPassword(clientPortal, doc);

    return tokenHandler(user, clientPortal, res, false);
  },

  UsersSendVerificationRequest: async (
    _root,
    args: {
      login: string;
      password: string;
      clientPortalId: string;
      attachments: IAttachment[];
      description: string;
    },
    { models }: IContext,
  ) => {
    const { login, password, clientPortalId, attachments, description } = args;

    const portalUser = await models.Users.findOne({
      $or: [
        { email: { $regex: new RegExp(`^${login}$`, 'i') } },
        { username: { $regex: new RegExp(`^${login}$`, 'i') } },
        { phone: { $regex: new RegExp(`^${login}$`, 'i') } },
      ],
      clientPortalId,
    });

    if (!portalUser) {
      throw new Error('User not found');
    }

    const valid = await models.Users.comparePassword(
      password,
      portalUser.password || '',
    );

    if (!valid) {
      // bad password
      throw new Error('Invalid login');
    }

    if (
      portalUser.verificationRequest &&
      portalUser.verificationRequest.status === 'approved'
    ) {
      throw new Error('User already verified');
    }

    const verificationRequest = {
      attachments,
      description,
      status: 'pending',
    };

    await models.Users.updateOne(
      { _id: portalUser._id },
      { $set: { verificationRequest } },
    );

    const createdBy = await sendTRPCMessage({
      pluginName: 'core',
      method: 'query',
      module: 'users',
      action: 'findOne',
      input: { role: 'system' },
    });

    const { manualVerificationConfig } = await models.Portals.getConfig(
      portalUser.clientPortalId,
    );

    // await sendCommonMessage({
    //   serviceName: 'notifications',

    //   action: 'send',
    //   data: {
    //     contentType: 'clientPortalUser',
    //     contentTypeId: portalUser._id,
    //     notifType: 'plugin',
    //     title: `New clientportal user verification request`,
    //     action: 'New clientportal user verification request',
    //     content: `clientportal user wants to be verified`,
    //     link: `/settings/client-portal/users/details/${portalUser._id}`,
    //     createdUser: createdBy,
    //     receivers:
    //       (manualVerificationConfig && manualVerificationConfig.userIds) || [],
    //   },
    // });

    return 'Verification request sent';
  },

  UsersChangeVerificationStatus: async (
    _root,
    args: { userId: string; status: string },
    { models, user }: IContext,
  ) => {
    if (!user) {
      throw new Error('login required');
    }

    const { userId, status } = args;

    const portalUser = await models.Users.getUser({ _id: userId });

    const { manualVerificationConfig } = await models.Portals.getConfig(
      portalUser.clientPortalId,
    );

    if (
      !manualVerificationConfig ||
      !manualVerificationConfig.userIds.includes(user._id)
    ) {
      throw new Error('Permission denied');
    }

    const verificationRequest = portalUser.verificationRequest || {
      attachments: [],
      description: '',
      status: 'notVerified',
      verifiedBy: user._id,
    };

    verificationRequest.status = status;

    await models.Users.updateOne(
      { _id: userId },
      { $set: { verificationRequest } },
    );

    return 'Verification status changed';
  },

  UsersReplacePhone: async (
    _root,
    args: { clientPortalId: string; phone: string },
    { models, portalUser }: IContext,
  ) => {
    if (!portalUser) {
      throw new Error('login required');
    }

    const { phone, clientPortalId } = args;

    const user = await models.Users.findOne({
      clientPortalId,
      phone,
    });

    if (user && user._id === portalUser._id) {
      throw new Error(
        'Please enter a different phone number than the current one',
      );
    }

    if (user) {
      throw new Error(
        'The phone number is already registered with another user',
      );
    }

    const cp = await models.Portals.getConfig(clientPortalId);

    const config: any = cp.otpConfig || {
      content:
        'Please enter the following code to verify your phone number: {{ code }}',
      smsTransporterType: 'messagePro',
      codeLength: 4,
      loginWithOTP: false,
      expireAfter: 5,
    };

    const code = random('0', config.codeLength);

    await redis.set(
      `portalUser:${portalUser._id}`,
      JSON.stringify({ code, phone }),
      'EX',
      60 * config.expireAfter,
    );

    await sendSms(
      config.smsTransporterType ? config.smsTransporterType : 'messagePro',
      phone,
      config.content.replace(/{.*}/, code),
    );

    return 'Confirmation code sent to your phone';
  },

  UsersVerifyPhone: async (
    _root,
    args: { code: string },
    { models, portalUser }: IContext,
  ) => {
    if (!portalUser) {
      throw new Error('login required');
    }

    const { code } = args;

    const redisObj = await redis.get(`portalUser:${portalUser._id}`);

    if (!redisObj) {
      throw new Error('Code has expired');
    }

    const { code: redisCode, phone } = JSON.parse(redisObj);

    if (redisCode !== code) {
      throw new Error('Invalid code');
    }

    await models.Users.updateOne(
      { _id: portalUser._id },
      { $set: { phoneVerified: true, phone } },
    );

    return 'Phone verified';
  },
  clientPortalUserAssignCompany: async (
    _root,
    args: { userId: string; erxesCompanyId: string; erxesCustomerId: string },
    { models, portalUser, user }: IContext,
  ) => {
    if (!portalUser && !user) {
      throw new Error('login required');
    }

    const { userId, erxesCompanyId, erxesCustomerId } = args;

    const company = await sendTRPCMessage({
      pluginName: 'core',
      method: 'query',
      module: 'companies',
      action: 'findOne',
      input: { _id: erxesCompanyId },
    });

    let setOps: any = { erxesCompanyId };

    if (company) {
      setOps = { ...setOps, companyName: company.primaryName };
    }

    try {
      await sendTRPCMessage({
        pluginName: 'core',
        method: 'mutation',
        module: 'conformities',
        action: 'addConformity',
        input: {
          mainType: 'customer',
          mainTypeId: erxesCustomerId,
          relType: 'company',
          relTypeId: erxesCompanyId,
        },
      });
    } catch (error) {
      throw new Error(error);
    }

    if (portalUser) {
      const cp = await models.Portals.findOne({
        _id: portalUser.clientPortalId,
      }).lean();

      if (cp?.kind === 'vendor') {
        await models.Companies.createOrUpdateCompany({
          erxesCompanyId,
          clientPortalId: cp._id,
        });
      }
    }

    return models.Users.updateOne({ _id: userId }, { $set: setOps });
  },
  clientPortalUpdateUser: async (
    _root,
    args: { _id: string; doc },
    { models }: IContext,
  ) => {
    const { _id, doc } = args;

    if (doc.phone) {
      const user = await models.Users.findOne({
        _id: { $ne: _id },
        phone: doc.phone,
        clientPortalId: doc.clientPortalId,
      });

      if (user) {
        throw new Error('Phone number already exists');
      }
    }

    await models.Users.updateOne({ _id }, { $set: doc });

    return models.Users.findOne({ _id });
  },

  clientPortalRefreshToken: async (
    _root,
    _args,
    { models, requestInfo, res }: IContext,
  ) => {
    const authHeader = requestInfo.headers.authorization;

    if (!authHeader) {
      throw new Error('Invalid refresh token');
    }

    const refreshToken = authHeader.replace('Bearer ', '');

    const newToken = await jwt.verify(
      refreshToken,
      process.env.JWT_TOKEN_SECRET || '',
      async (err, decoded) => {
        if (err) {
          throw new Error('Invalid refresh token');
        }

        const { userId } = decoded as any;
        const user = await models.Users.findOne({ _id: userId });

        if (!user) {
          throw new Error('User not found');
        }

        const clientPortal = await models.Portals.getConfig(
          user.clientPortalId,
        );

        const { tokenExpiration = 1 } = clientPortal || {
          tokenExpiration: 1,
        };

        const cookieOptions: any = {};

        const NODE_ENV = getEnv({ name: 'NODE_ENV' });

        if (!['test', 'development'].includes(NODE_ENV)) {
          cookieOptions.sameSite = 'none';
        }

        if (tokenExpiration) {
          cookieOptions.expires = tokenExpiration * 24 * 60 * 60 * 1000;
        }

        const options = authCookieOptions(cookieOptions);

        const token = jwt.sign(
          { userId: user._id, type: user.type } as any,
          process.env.JWT_TOKEN_SECRET || '',
          {
            expiresIn: `${tokenExpiration}d`,
          },
        );

        res.cookie('client-auth-token', token, options);

        return token;
      },
    );

    return newToken;
  },

  clientPortalUsersetSecondaryPassword: async (
    _root,
    args: { newPassword: string; oldPassword?: string },
    { models, portalUser }: IContext,
  ) => {
    if (!portalUser) {
      throw new Error('login required');
    }

    const { newPassword, oldPassword } = args;

    return models.Users.setSecondaryPassword(
      portalUser._id,
      newPassword,
      oldPassword,
    );
  },

  async clientPortalUsersMove(
    _root,
    {
      oldClientPortalId,
      newClientPortalId,
    }: { oldClientPortalId: string; newClientPortalId: string },
    { models }: IContext,
  ) {
    const updated = await models.Users.moveUser(
      oldClientPortalId,
      newClientPortalId,
    );

    return updated;
  },
};

export const userMutations = {
  clientPortalUserEditProfile: async (
    _root,
    args,
    { models, portalUser }: IContext,
  ) => {
    if (!portalUser) {
      throw new Error('login required');
    }

    return await models.Users.updateUser(portalUser._id, args.input);
  },
};

checkPermission(
  clientPortalUserMutations,
  'clientPortalUpdateUser',
  'updateUser',
);
