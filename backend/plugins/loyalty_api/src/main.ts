import { redis, startPlugin } from 'erxes-api-shared/utils';
import {
  createCoreModuleProducerHandler,
  TImportExportProducers,
  TGetExportDataInput,
  TGetExportHeadersInput,
} from 'erxes-api-shared/core-modules';
import resolvers from '~/apollo/resolvers';
import { typeDefs } from '~/apollo/typeDefs';
import { generateModels } from '~/connectionResolvers';
import { appRouter } from '~/trpc/init-trpc';
import { initMQWorkers } from '~/worker';
import { couponExportHandlers } from '~/modules/coupon/meta/import-export/export/exportHandlers';

startPlugin({
  name: 'loyalty',
  port: 3309,
  graphql: async () => ({
    typeDefs: await typeDefs(),
    resolvers,
  }),
  apolloServerContext: async (subdomain, context) => {
    const models = await generateModels(subdomain);

    context.models = models;

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
  onServerInit: async () => {
    await initMQWorkers(redis);
  },
  importExport: {
    export: {
      getExportHeaders: createCoreModuleProducerHandler({
        moduleName: 'importExport',
        modules: { coupon: couponExportHandlers },
        methodName: TImportExportProducers.GET_EXPORT_HEADERS,
        extractModuleName: (input: TGetExportHeadersInput) => input.moduleName,
        generateModels,
      }),
      getExportData: createCoreModuleProducerHandler({
        moduleName: 'importExport',
        modules: { coupon: couponExportHandlers },
        methodName: TImportExportProducers.GET_EXPORT_DATA,
        extractModuleName: (input: TGetExportDataInput) => input.moduleName,
        generateModels,
      }),
    },
  },
});
