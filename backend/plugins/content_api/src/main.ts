import { typeDefs } from './apollo/typeDefs';

import { startPlugin } from 'erxes-api-shared/utils';
import resolvers from './apollo/resolvers';
import { generateModels } from './connectionResolvers';
import { permissions } from './meta/permissions';

startPlugin({
  name: 'content',
  port: 3303,
  graphql: async () => ({
    typeDefs: await typeDefs(),
    resolvers: resolvers,
  }),
  apolloServerContext: async (subdomain, context) => {
    const models = await generateModels(subdomain, context);

    context.models = models;

    return context;
  },
  meta: {
    permissions,
  },
});
