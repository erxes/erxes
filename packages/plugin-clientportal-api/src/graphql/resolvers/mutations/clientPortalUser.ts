import { authCookieOptions, getEnv } from '@erxes/api-utils/src/core';
import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IAttachment } from '@erxes/api-utils/src/types';
import * as randomize from 'randomatic';

import { tokenHandler } from '../../../auth/authUtils';
import { IContext } from '../../../connectionResolver';
import { sendCoreMessage } from '../../../messageBroker';
import { ILoginParams } from '../../../models/ClientPortalUser';
import {
  IInvitiation,
  IUser,
  ITwoFactorDevice,
} from '../../../models/definitions/clientPortalUser';
import redis from '../../../redis';
import { sendSms } from '../../../utils';
import { sendCommonMessage } from './../../../messageBroker';
import * as jwt from 'jsonwebtoken';
import { fetchUserFromSocialpay } from '../../../socialpayUtils';
import fetch from 'node-fetch';
import { TwoFactorConfig } from '../../../models/definitions/clientPortal';

export interface IVerificationParams {
  userId: string;
  emailOtp?: string;
  phoneOtp?: string;
  password?: string;
  twoFactor?: ITwoFactorDevice;
}

interface IClientPortalUserEdit extends IUser {
  _id: string;
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

const clientPortalUserMutations = {
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
    { models, subdomain }: IContext
  ) {
    const user = await models.ClientPortalUsers.confirmInvitation(subdomain, {
      token,
      password,
      passwordConfirmation,
      username,
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
      ...args,
    });

    return user._id;
  },

  clientPortalVerifyOTP: async (
    _root,
    args: IVerificationParams,
    context: IContext
  ) => {
    const { models, res, subdomain } = context;

    const user = await models.ClientPortalUsers.verifyUser(subdomain, args);

    if (!user) {
      throw new Error('User not found');
    }

    const clientPortal = await models.ClientPortals.getConfig(
      user.clientPortalId
    );

    const optConfig = clientPortal.otpConfig;

    if (optConfig && optConfig.loginWithOTP) {
      return tokenHandler(user, clientPortal, res, false);
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
    { models, res }: IContext
  ) => {
    const { user, clientPortal, isPassed2FA } =
      await models.ClientPortalUsers.login(args);

    return tokenHandler(
      user,
      clientPortal,
      res,
      clientPortal.twoFactorConfig?.enableTwoFactor,
      isPassed2FA
    );
  },

  clientPortalFacebookAuthentication: async (
    _root,
    args: any,
    { subdomain, models, res }: IContext
  ) => {
    const { clientPortalId, accessToken } = args;

    try {
      const response = await fetch(
        'https://graph.facebook.com/v12.0/me?' +
          new URLSearchParams({
            access_token: accessToken,
            fields:
              'id,name,email,gender,education,work,picture,last_name,first_name',
          })
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

      let customer = await sendCoreMessage({
        subdomain,
        action: 'customers.findOne',
        data: {
          customerPrimaryEmail: email,
        },
        isRPC: true,
      });
      if (customer) {
        qry = { erxesCustomerId: customer._id, clientPortalId };
      }

      user = await models.ClientPortalUsers.findOne(qry);

      if (!user) {
        user = await models.ClientPortalUsers.create({
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
        customer = await sendCoreMessage({
          subdomain,
          action: 'customers.createCustomer',
          data: {
            firstName: first_name,
            lastName: last_name,
            primaryEmail: trimmedMail,
            state: 'lead',
            avatar: picture?.data?.url,
            emailValidationStatus: email && 'valid',
          },
          isRPC: true,
        });
      }

      if (customer && customer._id) {
        user.erxesCustomerId = customer._id;
        await models.ClientPortalUsers.updateOne(
          { _id: user._id },
          { $set: { erxesCustomerId: customer._id } }
        );
      }

      const clientPortal = await models.ClientPortals.getConfig(
        user.clientPortalId
      );

      return tokenHandler(user, clientPortal, res, false);
    } catch (e) {
      throw new Error(e.message);
    }
  },

  clientPortalGoogleAuthentication: async (
    _root,
    args: any,
    { subdomain, models, requestInfo, res }: IContext
  ) => {
    const { clientPortalId, code } = args;

    const clientPortals = await models.ClientPortals.getConfig(clientPortalId);

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
              client_id: clientPortals.googleClientId || '',
              grant_type: 'authorization_code',
              client_secret: clientPortals.googleClientSecret || '',
              redirect_uri: clientPortals.googleRedirectUri || '',
            }),
          {
            method: 'POST',
          }
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
          }
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

    let customer = await sendCoreMessage({
      subdomain,
      action: 'customers.findOne',
      data: {
        customerPrimaryEmail: email,
      },
      isRPC: true,
    });
    if (customer) {
      qry = { erxesCustomerId: customer._id, clientPortalId };
    }
    if (id) {
      qry = { googleId: id };
    }

    user = await models.ClientPortalUsers.findOne(qry);

    if (!user) {
      user = await models.ClientPortalUsers.create({
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
      await models.ClientPortalUsers.updateOne(
        { _id: user._id },
        {
          $set: {
            avatar: picture,
            lastName: family_name,
            firstName: given_name,
            isEmailVerified: true,
          },
        }
      );
    }

    if (!customer) {
      customer = await sendCoreMessage({
        subdomain,
        action: 'customers.createCustomer',
        data: {
          firstName: given_name,
          lastName: family_name,
          primaryEmail: trimmedMail,
          state: 'lead',
          avatar: picture,
          emailValidationStatus: 'valid',
        },
        isRPC: true,
      });
    }

    if (customer && customer._id) {
      user.erxesCustomerId = customer._id;
      await models.ClientPortalUsers.updateOne(
        { _id: user._id },
        { $set: { erxesCustomerId: customer._id } }
      );
    }

    const clientPortal = await models.ClientPortals.getConfig(
      user.clientPortalId
    );

    return tokenHandler(user, clientPortal, res, false);
  },

  /*
   * Logout
   */
  async clientPortalLogout(_root, _args, { res, cpUser, models }: IContext) {
    const NODE_ENV = getEnv({ name: 'NODE_ENV' });

    const options: any = {
      httpOnly: true,
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
  async clientPortalUserChangePassword(
    _root,
    args: { currentPassword: string; newPassword: string },
    { cpUser, models }: IContext
  ) {
    return models.ClientPortalUsers.changePassword({
      _id: (cpUser && cpUser._id) || '',
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
    { models }: IContext
  ) {
    return models.ClientPortalUsers.changePasswordWithCode(args);
  },

  async clientPortalResetPassword(
    _root,
    args: { token: string; newPassword: string },
    { models }: IContext
  ) {
    return models.ClientPortalUsers.clientPortalResetPassword(args);
  },

  async clientPortalForgotPassword(
    _root,
    args: {
      clientPortalId: string;
      phone: string;
      email: string;
      isSecondary: boolean;
    },
    { models, subdomain }: IContext
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

    const clientPortal = await models.ClientPortals.getConfig(clientPortalId);

    const { token, phoneCode } = await models.ClientPortalUsers.forgotPassword(
      clientPortal,
      phone,
      email
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
            `${clientPortal.url}/reset-password?token=${token}`
          )
        : passwordVerificationConfig.smsContent.replace(/{.*}/, phoneCode);

      await sendSms(subdomain, config.smsTransporterType, phone, smsContent);

      return 'sent';
    }

    const emailContent = verifyByLink
      ? passwordVerificationConfig.emailContent.replace(
          /{{ link }}/,
          `${clientPortal.url}/reset-password?token=${token}`
        )
      : passwordVerificationConfig.emailContent.replace(/{.*}/, phoneCode);

    await sendCoreMessage({
      subdomain,
      action: 'sendEmail',
      data: {
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

  clientPortalUsersInvite: async (
    _root,
    args: IInvitiation,
    context: IContext
  ) => {
    const { models, subdomain } = context;

    const user = await models.ClientPortalUsers.invite(subdomain, {
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
    { models, subdomain, res }: IContext
  ) => {
    const { phone, clientPortalId, deviceToken } = args;

    const clientPortal = await models.ClientPortals.getConfig(clientPortalId);

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

    const user = await models.ClientPortalUsers.loginWithoutPassword(
      subdomain,
      clientPortal,
      doc,
      deviceToken
    );

    try {
      if (clientPortal?.testUserPhone && clientPortal._id) {
        const cpUser = await models.ClientPortalUsers.findOne({
          firstName: 'test clientportal user',
          clientPortalId: clientPortal._id,
        });

        if (cpUser) {
          if (!clientPortal?.testUserOTP) {
            throw new Error('Test user phone otp not provided!');
          }

          if (
            config.codeLength !== clientPortal?.testUserOTP?.toString().length
          ) {
            throw new Error(
              'Client portal otp config and test user otp does not same length!'
            );
          }

          if (
            clientPortal?.testUserOTP &&
            config.codeLength === clientPortal?.testUserOTP?.toString().length
          ) {
            const testPhoneCode =
              await models.ClientPortalUsers.imposeVerificationCode({
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
              subdomain,
              config.smsTransporterType
                ? config.smsTransporterType
                : 'messagePro',
              clientPortal?.testUserPhone,
              body
            );
          }

          return { userId: user._id, message: 'Sms sent' };
        }
      }
    } catch (e) {
      console.error(e.message);
    }

    const phoneCode = await models.ClientPortalUsers.imposeVerificationCode({
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
        subdomain,
        config.smsTransporterType ? config.smsTransporterType : 'messagePro',
        phone,
        body
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
    { models, subdomain, res, cpUser }: IContext
  ) => {
    if (!cpUser) {
      throw new Error('User is not logged in');
    }
    const { byPhone, byEmail, deviceToken } = args;

    const clientPortal = await models.ClientPortals.getConfig(
      cpUser.clientPortalId
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

    const doc = { phone: cpUser.phone, email: cpUser.email };

    try {
      if (clientPortal?.testUserPhone && clientPortal._id) {
        const cpUser = await models.ClientPortalUsers.findOne({
          firstName: 'test clientportal user',
          clientPortalId: clientPortal._id,
        });

        if (cpUser) {
          if (!clientPortal?.testUserOTP) {
            throw new Error('Test user phone otp not provided!');
          }

          if (
            config.codeLength !== clientPortal?.testUserOTP?.toString().length
          ) {
            throw new Error(
              'Client portal otp config and test user otp does not same length!'
            );
          }

          if (
            clientPortal?.testUserOTP &&
            config.codeLength === clientPortal?.testUserOTP?.toString().length
          ) {
            const testPhoneCode =
              await models.ClientPortalUsers.imposeVerificationCode({
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
              subdomain,
              config.smsTransporterType
                ? config.smsTransporterType
                : 'messagePro',
              clientPortal?.testUserPhone,
              body
            );
          }

          return { userId: cpUser._id, message: 'Sms sent' };
        }
      }
    } catch (e) {
      console.error(e.message);
    }
    if (byPhone) {
      if (!cpUser.phone) {
        throw new Error("User doesn't have phone");
      }
      const phoneCode = await models.ClientPortalUsers.imposeVerificationCode({
        clientPortalId: clientPortal._id,
        codeLength: config.codeLength,
        phone: cpUser.phone,
        expireAfter: config.expireAfter,
      });

      if (phoneCode) {
        const body =
          config.content.replace(/{.*}/, phoneCode) ||
          `Your verification code is ${phoneCode}`;

        await sendSms(
          subdomain,
          config.smsTransporterType ? config.smsTransporterType : 'messagePro',
          cpUser.phone,
          body
        );
      }
      return { userId: cpUser._id, message: 'Sms sent' };
    }

    if (cpUser.email && byEmail) {
      if (!cpUser.email) {
        throw new Error("User doesn't have email");
      }
      const emailCode = await models.ClientPortalUsers.imposeVerificationCode({
        clientPortalId: clientPortal._id,
        codeLength: config.codeLength,
        email: cpUser.email,
        expireAfter: config.expireAfter,
      });

      if (emailCode) {
        const body =
          config.content.replace(/{.*}/, emailCode) ||
          `Your OTP is ${emailCode}`;

        await sendCoreMessage({
          subdomain,
          action: 'sendEmail',
          data: {
            toEmails: [cpUser.email],
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
      return { userId: cpUser._id, message: 'Sent' };
    }
  },

  clientPortalVerify2FA: async (
    _root,
    args: { emailOtp?: string; phoneOtp?: string; twoFactor: ITwoFactorDevice },
    context: IContext
  ) => {
    const { models, res, subdomain, cpUser } = context;
    if (!cpUser) {
      throw new Error('User is not logged in');
    }

    if (!args.twoFactor) {
      throw new Error('Provide Two Factor Params.');
    }

    const clientPortal = await models.ClientPortals.getConfig(
      cpUser.clientPortalId
    );

    const twoFactorConfig = clientPortal.twoFactorConfig;
    const user = await models.ClientPortalUsers.verifyUser(subdomain, {
      emailOtp: args.emailOtp,
      phoneOtp: args.phoneOtp,
      twoFactor: args.twoFactor,
      userId: cpUser.id,
    });

    if (twoFactorConfig && twoFactorConfig.enableTwoFactor) {
      const twoFactorDevices: ITwoFactorDevice[] =
        cpUser.twoFactorDevices || [];
      if (!twoFactorDevices.includes(args.twoFactor)) {
        twoFactorDevices.push(args.twoFactor);
        await cpUser.updateOne({ $set: { twoFactorDevices } });
      }
      return tokenHandler(
        cpUser,
        clientPortal,
        res,
        twoFactorConfig.enableTwoFactor,
        true
      );
    }

    return '2Factor not enabled';
  },

  clientPortal2FADeleteKey: async (
    _root,
    args: { key: string },
    context: IContext
  ) => {
    const { models, res, subdomain, cpUser } = context;
    if (!cpUser) {
      throw new Error('User is not logged in');
    }

    const pull = await models.ClientPortalUsers.updateOne(
      { _id: cpUser.id },
      { $pull: { twoFactorDevices: { key: args.key } } }
    );

    return 'success';
  },
  clientPortalLoginWithMailOTP: async (
    _root,
    args: { email: string; clientPortalId: string; deviceToken },
    { models, subdomain, res }: IContext
  ) => {
    const { email, clientPortalId, deviceToken } = args;
    const clientPortal = await models.ClientPortals.getConfig(clientPortalId);

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

    const user = await models.ClientPortalUsers.loginWithoutPassword(
      subdomain,
      clientPortal,
      doc,
      deviceToken
    );

    try {
      if (clientPortal?.testUserEmail && clientPortal._id) {
        const cpUser = await models.ClientPortalUsers.findOne({
          firstName: 'test clientportal user',
          clientPortalId: clientPortal._id,
        });
        if (cpUser) {
          if (!clientPortal?.testUserOTP) {
            throw new Error('Test user email otp not provided!');
          }

          if (
            config.codeLength !== clientPortal?.testUserOTP?.toString().length
          ) {
            throw new Error(
              'Client portal otp config and test user otp does not same length!'
            );
          }

          if (
            clientPortal?.testUserOTP &&
            config.codeLength === clientPortal?.testUserOTP?.toString().length
          ) {
            const testEmailCode =
              await models.ClientPortalUsers.imposeVerificationCode({
                clientPortalId: clientPortal._id,
                codeLength: config.codeLength,
                email: clientPortal?.testUserEmail,
                expireAfter: config.expireAfter,
                testUserOTP: clientPortal?.testUserOTP,
              });

            const body =
              config.content.replace(/{.*}/, testEmailCode) ||
              `Your OTP is ${testEmailCode}`;

            await sendCoreMessage({
              subdomain,
              action: 'sendEmail',
              data: {
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

    const emailCode = await models.ClientPortalUsers.imposeVerificationCode({
      clientPortalId: clientPortal._id,
      codeLength: config.codeLength,
      email: user.email,
      expireAfter: config.expireAfter,
    });

    if (emailCode) {
      const body =
        config.content.replace(/{.*}/, emailCode) || `Your OTP is ${emailCode}`;

      await sendCoreMessage({
        subdomain,
        action: 'sendEmail',
        data: {
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
    { models, subdomain, res }: IContext
  ) => {
    const { token, clientPortalId } = args;

    const clientPortal = await models.ClientPortals.getConfig(clientPortalId);

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

    const user = await models.ClientPortalUsers.loginWithoutPassword(
      subdomain,
      clientPortal,
      doc
    );

    return tokenHandler(user, clientPortal, res, false);
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
        { phone: { $regex: new RegExp(`^${login}$`, 'i') } },
      ],
      clientPortalId,
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
      status: 'pending',
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
      defaultValue: {},
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
          (manualVerificationConfig && manualVerificationConfig.userIds) || [],
      },
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
      verifiedBy: user._id,
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
      phone,
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
      expireAfter: 5,
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
      config.smsTransporterType ? config.smsTransporterType : 'messagePro',
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
  clientPortalUserAssignCompany: async (
    _root,
    args: { userId: string; erxesCompanyId: string; erxesCustomerId: string },
    { models, subdomain, cpUser, user }: IContext
  ) => {
    if (!cpUser && !user) {
      throw new Error('login required');
    }

    const { userId, erxesCompanyId, erxesCustomerId } = args;

    const getCompany = await sendCoreMessage({
      subdomain,
      action: 'companies.findOne',
      data: { _id: erxesCompanyId },
      isRPC: true,
    });

    let setOps: any = { erxesCompanyId };

    if (getCompany) {
      setOps = { ...setOps, companyName: getCompany.primaryName };
    }

    try {
      // add conformity company to customer
      await sendCoreMessage({
        subdomain,
        action: 'conformities.addConformity',
        data: {
          mainType: 'customer',
          mainTypeId: erxesCustomerId,
          relType: 'company',
          relTypeId: erxesCompanyId,
        },
      });
    } catch (error) {
      throw new Error(error);
    }

    if (cpUser) {
      const cp = await models.ClientPortals.findOne({
        _id: cpUser.clientPortalId,
      }).lean();

      if (cp?.kind === 'vendor') {
        await models.Companies.createOrUpdateCompany({
          erxesCompanyId,
          clientPortalId: cp._id,
        });
      }
    }

    return models.ClientPortalUsers.updateOne(
      { _id: userId },
      { $set: setOps }
    );
  },
  clientPortalUpdateUser: async (
    _root,
    args: { _id: string; doc },
    { models }: IContext
  ) => {
    const { _id, doc } = args;

    if (doc.phone) {
      const user = await models.ClientPortalUsers.findOne({
        _id: { $ne: _id },
        phone: doc.phone,
        clientPortalId: doc.clientPortalId,
      });

      if (user) {
        throw new Error('Phone number already exists');
      }
    }

    await models.ClientPortalUsers.updateOne({ _id }, { $set: doc });

    return models.ClientPortalUsers.findOne({ _id });
  },

  clientPortalRefreshToken: async (
    _root,
    _args,
    { models, requestInfo, res }: IContext
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
        const user = await models.ClientPortalUsers.findOne({ _id: userId });

        if (!user) {
          throw new Error('User not found');
        }

        const clientPortal = await models.ClientPortals.getConfig(
          user.clientPortalId
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
          }
        );

        res.cookie('client-auth-token', token, options);

        return token;
      }
    );

    return newToken;
  },

  clientPortalUserSetSecondaryPassword: async (
    _root,
    args: { newPassword: string; oldPassword?: string },
    { models, cpUser }: IContext
  ) => {
    if (!cpUser) {
      throw new Error('login required');
    }

    const { newPassword, oldPassword } = args;

    return models.ClientPortalUsers.setSecondaryPassword(
      cpUser._id,
      newPassword,
      oldPassword
    );
  },

  async clientPortalUsersMove(
    _root,
    {
      oldClientPortalId,
      newClientPortalId,
    }: { oldClientPortalId: string; newClientPortalId: string },
    { models }: IContext
  ) {
    const updated = await models.ClientPortalUsers.moveUser(
      oldClientPortalId,
      newClientPortalId
    );

    return updated;
  },
};

checkPermission(
  clientPortalUserMutations,
  'clientPortalUpdateUser',
  'updateUser'
);

export default clientPortalUserMutations;
