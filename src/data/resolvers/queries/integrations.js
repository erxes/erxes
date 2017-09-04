import { Integrations } from '../../../db/models';

export default {
  integrations(root, { limit }) {
    return Integrations.find({}).limit(limit);
  },

  totalIntegrationsCount() {
    return Integrations.find({}).count();
  },
};
