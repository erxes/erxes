import { ClientPortals } from '../../../db/models';
import { IClientPortal } from '../../../db/models/definitions/clientPortal';
import { requireLogin } from '../../permissions/wrappers';

const configClientPortalMutations = {
  configUpdateClientPortal(_root, args: IClientPortal) {
    return ClientPortals.createOrUpdateConfig(args);
  }
};

// TODO permission, requireLogin
// moduleCheckPermission(configClientPortalMutations, 'manageGeneralSettings');
requireLogin(configClientPortalMutations, 'configUpdateClientPortal');

export default configClientPortalMutations;
