import { startPlugin } from 'erxes-api-shared/utils';
import { appRouter } from './trpc/init-trpc';
import { generateModels } from './connectionResolvers';
import { typeDefs } from './apollo/typeDefs';
import { resolvers } from './apollo/resolvers';

startPlugin({
  name: 'storage',
  port: Number(process.env.PORT) || 33020,
  graphql: async () => ({ typeDefs: await typeDefs(), resolvers }),
  apolloServerContext: async (subdomain, context) => {
    context.models = await generateModels(subdomain);
    return context;
  },
  trpcAppRouter: {
    router: appRouter,
    createContext: async (subdomain, context) => {
      context.models = await generateModels(subdomain);
      return context;
    },
  },
  meta: {
    permissions: {
      plugin: 'storage',
      modules: [
        {
          name: 'storage',
          description: 'RFID агуулах: бүс, ялтас, тооллого, хөдөлгөөн',
          scopes: [{ name: 'all', description: 'All records' }],
          actions: [
            { title: 'RFID агуулах харах', name: 'showStorage', description: 'RFID агуулах харах' },
            { title: 'RFID ялтас бүртгэх, тоолох', name: 'manageStorageTags', description: 'RFID ялтас бүртгэх, тоолох' },
            { title: 'Хайрцаг задлах, хөдөлгөөн илгээх', name: 'manageStorageMovements', description: 'Хайрцаг задлах, хөдөлгөөн илгээх' },
            { title: 'Агуулахын бүс тохируулах', name: 'manageStorageZones', description: 'Агуулахын бүс тохируулах' },
          ],
        },
      ],
    },
  },
});
