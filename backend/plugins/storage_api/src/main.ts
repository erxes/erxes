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
          description: 'Ухаалаг Агуулах, RFID, Төсөл, Бүтээц ба НӨАТ тулгалт',
          scopes: [{ name: 'all', description: 'All records' }],
          actions: [
          { title: 'Агуулахын үлдэгдэл харах', name: 'showStorageItems', description: 'Агуулахын үлдэгдэл харах' },
          { title: 'Орлого, зарлага, RFID задлах', name: 'manageStorageItems', description: 'Орлого, зарлага, RFID задлах' },
          { title: 'Ажлын захиалга харах', name: 'showStorageWorkOrders', description: 'Ажлын захиалга харах' },
          { title: 'Ажлын захиалга хаах / нээх', name: 'manageStorageWorkOrders', description: 'Ажлын захиалга хаах / нээх' },
          { title: 'Бүтээц / багаж харах', name: 'showStorageTools', description: 'Бүтээц / багаж харах' },
          { title: 'Багаж шилжүүлэх / баталгаажуулах', name: 'manageStorageTools', description: 'Багаж шилжүүлэх / баталгаажуулах' },
          { title: 'НӨАТ тулгалт хийх', name: 'manageStorageVat', description: 'НӨАТ тулгалт хийх' },
          { title: 'Сарын өртгийн хаалт хийх', name: 'manageStoragePeriodClose', description: 'Сарын өртгийн хаалт хийх' },
          ],
        },
      ],
    },
  },
});
