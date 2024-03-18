import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { setupMessageConsumers } from './messageBroker';
import { generateModels } from './connectionResolver';
import exporter from './exporter';
import segments from './segment';
import forms from './forms';

export default {
  name: 'xyp',
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
    };
  },

  apolloServerContext: async (context, req) => {
    const { subdomain } = context;

    context.models = await generateModels(subdomain);

    if (req.cpUser) {
      context.cpUser = req.cpUser;
    }
    return context;
  },

  onServerInit: async () => {},
  setupMessageConsumers,
  meta: {
    exporter,
    forms,
    segments,
  },
};
