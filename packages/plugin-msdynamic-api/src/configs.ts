import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { setupMessageConsumers } from './messageBroker';
import { generateModels } from './connectionResolver';
import afterMutations from './afterMutations';
import cpCustomerHandle from './cpCustomerHandle';

export default {
  name: 'msdynamic',
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
    };
  },

  meta: {
    afterMutations,
    cpCustomerHandle,
  },

  apolloServerContext: async (context, req) => {
    const { subdomain } = context;

    context.models = await generateModels(subdomain);

    return context;
  },

  onServerInit: async () => {},
  setupMessageConsumers,
};
