import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { generateModels } from './connectionResolver';

import { setupMessageConsumers } from './messageBroker';
import { initBrokerErkhet } from './messageBrokerErkhet';
import afterMutations from './afterMutations';
import * as permissions from './permissions';
import afterQueries from './afterQueries';
import { getOrderInfo } from './routes';

export default {
  name: 'syncerkhet',
  permissions,
  getHandlers: [{ path: `/getOrderInfo`, method: getOrderInfo }],
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
    };
  },
  apolloServerContext: async (context, req) => {
    const { subdomain } = context;

    context.models = await generateModels(subdomain);

    return context;
  },

  onServerInit: async () => {
    await initBrokerErkhet();
  },
  setupMessageConsumers,
  meta: {
    afterMutations,
    afterQueries,
    permissions,
  },
};
