import { Integrations } from '../../../db/models';

export default {
  integrations(root, { limit, kind }) {
    const query = {};
    const sort = { createdAt: -1 };

    if (kind) {
      query.kind = kind;
    }

    const integrations = Integrations.find(query);

    if (limit) {
      return integrations.sort(sort).limit(limit);
    }

    return integrations.sort(sort);
  },

  integrationDetail(root, { _id }) {
    return Integrations.findOne({ _id });
  },

  totalIntegrationsCount(root, { kind }) {
    return Integrations.find({ kind }).count();
  },
};
