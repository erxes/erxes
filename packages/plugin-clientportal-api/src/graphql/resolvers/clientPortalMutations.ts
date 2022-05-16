import { IClientPortal, IUser } from '../../models/definitions/clientPortal';
import { BOARD_STATUSES } from '../../models/definitions/constants';
import { checkPermission } from '@erxes/api-utils/src';
import { sendCardsMessage, sendContactsMessage } from '../../messageBroker';
import { IContext, models } from '../../connectionResolver';
import * as express from 'express';
import { authCookieOptions, sendSms } from '../../../utils';
// import twilio from 'twilio';

interface ILoginParams {
  type?: string;
  email: string;
  password: string;
  deviceToken?: string;
  description?: string;
}

interface ICreateCard {
  type: string;
  email: string;
  subject: string;
  description: string;
  priority: string;
  stageId: string;
}

// const login = async (
//   args: ILoginParams,
//   res: express.Response,
//   secure: boolean,
//   { models }: IContext
// ) => {
//   const response = await models.ClientPortalUsers.login(args);

//   const { token } = response;

//   res.cookie('client-auth-token', token, authCookieOptions(secure));

//   return 'loggedIn';
// };

const configClientPortalMutations = {
  clientPortalConfigUpdate(_root, args: IClientPortal, { models }: IContext) {
    return models.ClientPortals.createOrUpdateConfig(args);
  },

  clientPortalRemove(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.ClientPortals.deleteOne({ _id });
  },

  async clientPortalCreateCustomer(
    _root,
    args: {
      configId: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      avatar: string;
    },
    { models, subdomain }: IContext
  ) {
    await models.ClientPortals.getConfig(args.configId);

    const customer = await sendContactsMessage({
      subdomain,
      action: 'customers.findOne',
      data: {
        customerPrimaryEmail: args.email,
        customerPrimaryPhone: args.phone
      },
      isRPC: true
    });

    if (customer) {
      return customer;
    }

    return sendContactsMessage({
      subdomain,
      action: 'customers.createCustomer',
      data: {
        firstName: args.firstName,
        lastName: args.lastName,
        primaryEmail: args.email,
        primaryPhone: args.phone,
        state: 'customer',
        avatar: args.avatar
      },
      isRPC: true
    });
  },

  async clientPortalCreateCompany(
    _root,
    args: {
      configId: string;
      companyName: string;
      email: string;
    },
    { models, subdomain }: IContext
  ) {
    await models.ClientPortals.getConfig(args.configId);

    return sendContactsMessage({
      subdomain,
      action: 'companies.createCompany',
      data: {
        primaryName: args.companyName,
        primaryEmail: args.email,
        names: [args.companyName],
        emails: [args.email]
      },
      isRPC: true
    });
  },

  async clientPortalCreateCard(
    _root,
    { type, email, subject, priority, description, stageId }: ICreateCard,
    { subdomain }: IContext
  ) {
    const customer = await sendContactsMessage({
      subdomain,
      action: 'customers.find',
      data: { primaryEmail: email },
      isRPC: true
    });

    if (!customer) {
      throw new Error('Customer not registered');
    }

    const dataCol = {
      userId: customer._id,
      name: subject,
      description,
      priority,
      stageId,
      status: BOARD_STATUSES.ACTIVE
    };

    return type === 'ticket'
      ? await sendCardsMessage({
          subdomain,
          action: 'tickets.create',
          data: dataCol,
          isRPC: true
        })
      : await sendCardsMessage({
          subdomain,
          action: 'tasks.create',
          data: dataCol,
          isRPC: true
        });
  }
};

const clientPortalUserMutations = {
  clientPortalUserAdd: async (_root, args: IUser, { models }: IContext) => {
    return models.ClientPortalUsers.createUser(args);
  },

  /*
   * Login
   */
  // clientPortalLogin: async (_root, args: ILoginParams, { res, requestInfo }: IContext) => {
  //   return login(args, res, requestInfo.secure);
  // },

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
    { user, models }: IContext
  ) {
    return models.ClientPortalUsers.changePassword({ _id: user._id, ...args });
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

  /*
   * Edit user profile
   */
  async clientPortalUserEdit(_root, args: IUser, { user, models }: IContext) {
    return models.ClientPortalUsers.editProfile(user._id, args);
  },

  async clientPortalSendVerificationCode(
    _root,
    { phone },
    { models }: IContext
  ) {
    const code = await models.ClientPortalUsers.imposeVerificationCodePhone(
      phone
    );

    const body = `Your verification code is ${code}`;

    return sendSms(phone, body);
  }
};

checkPermission(
  configClientPortalMutations,
  'clientPortalConfigUpdate',
  'manageClientPortal'
);

checkPermission(
  configClientPortalMutations,
  'clientPortalRemove',
  'manageClientPortal'
);

export default { ...configClientPortalMutations, ...clientPortalUserMutations };
