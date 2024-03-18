import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { setupMessageConsumers } from './messageBroker';
import { generateModels } from './connectionResolver';
import initApp from './initApp';
import { INTEGRATION_KINDS } from './constants';

export default {
  name: 'instagram',
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
    };
  },
  meta: {
    inboxIntegrations: [
      {
        kind: INTEGRATION_KINDS.MESSENGER,
        label: 'Instagram messenger',
      },
    ],
  },
  apolloServerContext: async (context, req) => {
    const { subdomain } = context;
    const models = await generateModels(subdomain);

    context.models = models;

    return context;
  },

  onServerInit: async () => {
    initApp();
  },
  setupMessageConsumers,
};
