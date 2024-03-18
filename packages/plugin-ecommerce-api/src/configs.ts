import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { setupMessageConsumers } from './messageBroker';
import { generateModels } from './connectionResolver';

export default {
  name: 'ecommerce',
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
};
