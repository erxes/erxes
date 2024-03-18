import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { setupMessageConsumers } from './messageBroker';
import { generateModels } from './connectionResolver';
import afterMutations from './afterMutations';

export default {
  name: 'grants',
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
    };
  },
  apolloServerContext: async (context, req) => {
    const { subdomain } = context;
    const models = await generateModels(subdomain);

    context.models = models;

    return context;
  },

  meta: {
    afterMutations,
  },

  onServerInit: async () => {},
  setupMessageConsumers,
};
