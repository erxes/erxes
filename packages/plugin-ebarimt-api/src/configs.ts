import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { generateModels } from './connectionResolver';
import afterMutations from './afterMutations';
import { setupMessageConsumers } from './messageBroker';
import * as permissions from './permissions';
import beforeResolvers from './beforeResolvers';

export default {
  name: 'ebarimt',
  permissions,
  hasSubscriptions: true,
  subscriptionPluginPath: require('path').resolve(
    __dirname,
    'graphql',
    'subscriptionPlugin.js',
  ),
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
  onServerInit: async () => {},
  setupMessageConsumers,
  meta: {
    afterMutations,
    beforeResolvers,
    permissions,
  },
};
