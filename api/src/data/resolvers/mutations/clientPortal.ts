import {
  ClientPortals,
  Companies,
  Customers,
  Tasks,
  Tickets
} from '../../../db/models';
import { IClientPortal } from '../../../db/models/definitions/clientPortal';
import { BOARD_STATUSES } from '../../../db/models/definitions/constants';
import { requireLogin } from '../../permissions/wrappers';

interface ICreateCard {
  type: string;
  email: string;
  subject: string;
  description: string;
  priority: string;
  stageId: string;
}

const configClientPortalMutations = {
  async clientPortalCreateCustomer(
    _root,
    args: {
      configId: string;
      firstName: string;
      lastName: string;
      email: string;
    }
  ) {
    const config = await ClientPortals.findOne({ _id: args.configId }).lean();

    if (!config) {
      throw new Error('Config not found');
    }

    return Customers.createCustomer({
      firstName: args.firstName,
      lastName: args.lastName,
      primaryEmail: args.email,
      state: 'customer'
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
    const config = await ClientPortals.findOne({ _id: args.configId }).lean();

    if (!config) {
      throw new Error('Config not found');
    }

    return Companies.createCompany({
      primaryName: args.companyName,
      primaryEmail: args.email,
      names: [args.companyName],
      emails: [args.email]
    });
  },

  async clientPortalCreateCard(
    _root,
    { type, email, subject, priority, description, stageId }: ICreateCard
  ) {
    const customer = await Customers.findOne({ primaryEmail: email }).lean();

    if (!customer) {
      throw new Error('Customer not registered');
    }

    const collection = type === 'ticket' ? Tickets : Tasks;

    return collection.create({
      userId: customer._id,
      name: subject,
      description,
      priority,
      stageId,
      status: BOARD_STATUSES.ACTIVE
    });
  },

  clientPortalConfigUpdate(_root, args: IClientPortal) {
    return ClientPortals.createOrUpdateConfig(args);
  }
};

requireLogin(configClientPortalMutations, 'clientPortalConfigUpdate');

export default configClientPortalMutations;
