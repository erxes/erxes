import { ClientPortals } from '../../models';
import { IClientPortal } from '../../models/definitions/clientPortal';
import { BOARD_STATUSES } from '../../models/definitions/constants';
import { checkPermission } from '@erxes/api-utils/src';
import { sendCardsMessage, sendContactsMessage } from '../../messageBroker';

interface ICreateCard {
  type: string;
  email: string;
  subject: string;
  description: string;
  priority: string;
  stageId: string;
}

const configClientPortalMutations = {
  clientPortalConfigUpdate(_root, args: IClientPortal) {
    return ClientPortals.createOrUpdateConfig(args);
  },

  clientPortalRemove(_root, { _id }: { _id: string }) {
    return ClientPortals.deleteOne({ _id });
  },

  async clientPortalCreateCustomer(
    _root,
    args: {
      configId: string;
      firstName: string;
      lastName: string;
      email: string;
    }
  ) {
    await ClientPortals.getConfig(args.configId);

    return sendContactsMessage('create_customer', {
      firstName: args.firstName,
      lastName: args.lastName,
      primaryEmail: args.email,
      state: 'customer',
    });
  },

  async clientPortalCreateCompany(
    _root,
    args: {
      configId: string;
      companyName: string;
      email: string;
    }
  ) {
    await ClientPortals.getConfig(args.configId);

    return sendContactsMessage('createCompany', {
      primaryName: args.companyName,
      primaryEmail: args.email,
      names: [args.companyName],
      emails: [args.email],
    });
  },

  async clientPortalCreateCard(
    _root,
    { type, email, subject, priority, description, stageId }: ICreateCard
  ) {
    const customer = await sendContactsMessage('findCustomer', {
      primaryEmail: email,
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
      status: BOARD_STATUSES.ACTIVE,
    };

    return type === 'ticket'
      ? await sendCardsMessage('createTickets', { dataCol })
      : await sendCardsMessage('createTasks', { dataCol });
  },
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
