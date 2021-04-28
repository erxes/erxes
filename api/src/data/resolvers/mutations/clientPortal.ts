import {
  ClientPortals,
  Companies,
  Customers,
  TicketComments,
  Tickets
} from '../../../db/models';
import { IClientPortal } from '../../../db/models/definitions/clientPortal';
import { BOARD_STATUSES } from '../../../db/models/definitions/constants';
import { IComment } from '../../../db/models/definitions/tickets';
import { requireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';

interface ICustomerTicket {
  email: string;
  subject: string;
  description: string;
  priority: string;
  stageId: string;
}

interface ICommentEdit extends IComment {
  _id: string;
}

interface ICommentParams extends IComment {
  email: string;
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

  async clientPortalCreateTicket(
    _root,
    { email, subject, priority, description, stageId }: ICustomerTicket
  ) {
    const customer = await Customers.findOne({ primaryEmail: email }).lean();

    if (!customer) {
      throw new Error('Customer not registered');
    }

    return Tickets.create({
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
  },

  async createTicketComment(_root, args: ICommentParams, { user }: IContext) {
    const doc = args;
    const { email } = args;

    if (user) {
      doc.userId = user._id;
    }

    if (email) {
      const customer = await Customers.findOne({ primaryEmail: email }).lean();

      if (!customer) {
        throw new Error('Customer not registered');
      }

      doc.customerId = customer._id;
    }

    return TicketComments.createComment(doc);
  },

  updateTicketComment(_root, { _id, ...args }: ICommentEdit) {
    return TicketComments.updateComment(_id, args);
  },

  removeTicketComment(_root, { _id }: { _id: string }) {
    return TicketComments.removeComment(_id);
  }
};

// TODO permission, requireLogin
// moduleCheckPermission(configClientPortalMutations, 'manageGeneralSettings');
requireLogin(configClientPortalMutations, 'clientPortalConfigUpdate');

export default configClientPortalMutations;
