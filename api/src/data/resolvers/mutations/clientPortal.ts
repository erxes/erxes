import { ClientPortals, Customers } from '../../../db/models';
import { IClientPortal } from '../../../db/models/definitions/clientPortal';
import { requireLogin } from '../../permissions/wrappers';

const configClientPortalMutations = {
  async createCustomer(
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

  configUpdateClientPortal(_root, args: IClientPortal) {
    return ClientPortals.createOrUpdateConfig(args);
  }
};

// TODO permission, requireLogin
// moduleCheckPermission(configClientPortalMutations, 'manageGeneralSettings');
requireLogin(configClientPortalMutations, 'configUpdateClientPortal');

export default configClientPortalMutations;
