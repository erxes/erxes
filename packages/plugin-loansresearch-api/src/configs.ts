import typeDefs from './graphql/typeDefs';
import { generateModels } from './connectionResolver';
import { setupMessageConsumers } from './messageBroker';
import { getSubdomain } from '@erxes/api-utils/src/core';
import resolvers from './graphql/resolvers';
import * as permissions from './permissions';
import afterMutations from './afterMutations';

export default {
  name: 'loansresearch',
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
    };
  },

  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    context.subdomain = subdomain;
    context.models = await generateModels(subdomain);

    return context;
  },

  onServerInit: async () => {},
  setupMessageConsumers,
  meta: { permissions, afterMutations },
};
