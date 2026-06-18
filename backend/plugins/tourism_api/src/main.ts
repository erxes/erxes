import { redis, sendTRPCMessage, startPlugin } from 'erxes-api-shared/utils';
import { appRouter } from '~/trpc/init-trpc';
import { initMQWorkers } from '~/worker';

import { generateModels } from './connectionResolvers';
import { typeDefs } from './apollo/typeDefs';
import resolvers from './apollo/resolvers';

startPlugin({
  name: 'tourism',
  port: 3311,
  graphql: async () => ({
    typeDefs: await typeDefs(),
    resolvers: resolvers,
  }),
  apolloServerContext: async (subdomain, context) => {
    const models = await generateModels(subdomain, context);

    context.models = models;

    const fields = await sendTRPCMessage({
      subdomain,
      method: 'query',
      pluginName: 'core',
      module: 'propertyFields',
      action: 'find',
      input: {
        query: { _id: 'status' },
      },
      defaultValue: [],
    });

    if (fields.length === 0) {
      await sendTRPCMessage({
        subdomain,
        method: 'mutation',
        pluginName: 'core',
        module: 'propertyFields',
        action: 'create',
        input: {
          data: {
            _id: 'status',
            code: 'status',
            name: 'Status',
            icon: 'IconArrowBackUp',
            type: 'text',
            groupId: 'oBJkzKucFS9D8uXand7Fy',
            contentType: 'core:customer',
          },
        },
      });
    }

    return context;
  },
  trpcAppRouter: {
    router: appRouter,
    createContext: async (subdomain, context) => {
      const models = await generateModels(subdomain);

      context.models = models;

      return context;
    },
  },
  //
  // onServerInit: async () => {
  //   await initMQWorkers(redis);
  // },
});
