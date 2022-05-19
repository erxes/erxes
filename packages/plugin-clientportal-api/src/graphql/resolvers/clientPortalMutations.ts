import {
  IClientPortal,
  IUser,
  IUserDocument
} from '../../models/definitions/clientPortal';
import { BOARD_STATUSES } from '../../models/definitions/constants';
import { checkPermission } from '@erxes/api-utils/src';
import { sendCardsMessage, sendContactsMessage } from '../../messageBroker';
import { IContext } from '../../connectionResolver';
import { authCookieOptions, cpUserMiddleware } from '../../auth/authUtils';
import { ILoginParams } from '../../models/ClientPortal';

type UserEdit = {
  _id: string;
} & IUser;

interface ICreateCard {
  type: string;
  email: string;
  subject: string;
  description: string;
  priority: string;
  stageId: string;
}

export interface IVerificationParams {
  userId: string;
  emailOtp?: string;
  phoneOtp?: string;
}

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
      clientPortalId: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      avatar: string;
    },
    { models, subdomain }: IContext
  ) {
    await models.ClientPortals.getConfig(args.clientPortalId);

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
  clientPortalUserAdd: async (
    _root,
    args: IUser,
    { models, subdomain }: IContext
  ) => {
    const config = await models.ClientPortals.getConfig(args.clientPortalId);

    return models.ClientPortalUsers.createUser(subdomain, args, config);
  },

  clientPortalRegister: async (_root, args: IUser, context: IContext) => {
    const { models, subdomain } = context;
    const config = await models.ClientPortals.getConfig(args.clientPortalId);

    return models.ClientPortalUsers.createUser(subdomain, args, config);
  },

  clientPortalVerifyOTP: async (
    _root,
    args: IVerificationParams,
    context: IContext
  ) => {
    const { models } = context;

    return models.ClientPortalUsers.verifyUser(args);
  },

  /*
   * Login
   */
  clientPortalLogin: async (_root, args: ILoginParams, context: IContext) => {
    await cpUserMiddleware(context);
    const { token } = await context.models.ClientPortalUsers.login(args);
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
  async clientPortalUserEdit(_root, args: UserEdit, { models }: IContext) {
    const { _id, ...doc } = args;

    return models.ClientPortalUsers.editProfile(_id, doc);
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
