import { Integrations } from '../../../db/models';

export default {
  integrations(root, { limit, kind }) {
    const query = {};

    if (kind) {
      query.kind = kind;
    }

    const integrations = Integrations.find(query);

    if (limit) {
      return integrations.limit(limit);
    }

    return integrations;
  },

  totalIntegrationsCount(root, { kind }) {
    return Integrations.find({ kind }).count();
  },
};
