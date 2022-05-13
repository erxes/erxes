import { IClientPortal } from '../../models/definitions/clientPortal';
import { BOARD_STATUSES } from '../../models/definitions/constants';
import { checkPermission } from '@erxes/api-utils/src';
import { sendCardsMessage, sendContactsMessage } from '../../messageBroker';
import { IContext } from '../../connectionResolver';

interface ICreateCard {
  type: string;
  email: string;
  subject: string;
  description: string;
  priority: string;
  stageId: string;
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

export default configClientPortalMutations;
