import { ClientPortals } from '../../../db/models';

const configClientPortalQueries = {
  async configClientPortal(_root) {
    return ClientPortals.getConfig();
  }
};

export default configClientPortalQueries;
