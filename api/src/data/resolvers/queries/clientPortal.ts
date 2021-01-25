import { ClientPortals } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions/wrappers';

const configClientPortalQueries = {
  async configClientPortal(_root) {
    return ClientPortals.getConfig();
  }
};

moduleRequireLogin(configClientPortalQueries);

export default configClientPortalQueries;
