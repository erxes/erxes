import {
  TBatchSkipRowInput,
  createCoreModuleProducerHandler,
  TGetImportHeadersInput,
  TImportExportProducers,
  TInsertImportRowsInput,
} from 'erxes-api-shared/core-modules';
import { startPlugin } from 'erxes-api-shared/utils';
import { typeDefs } from '~/apollo/typeDefs';
import { afterProcess } from '~/meta/afterProcess';
import { permissions } from '~/meta/permissions';
import resolvers from './apollo/resolvers';
import { generateModels } from './connectionResolvers';
import { appRouter } from './init-trpc';
import { accountImportHandlers } from './meta/import-export/import/importHandlers';

const accountImportTypes = [
  {
    label: 'Account',
    contentType: 'accounting:account.account',
  },
];

startPlugin({
  name: 'accounting',
  port: 3308,
  graphql: async () => ({
    typeDefs: await typeDefs(),
    resolvers: resolvers,
  }),
  hasSubscriptions: true,
  subscriptionPluginPath: require('path').resolve(
    __dirname,
    'apollo',
    process.env.NODE_ENV === 'production'
      ? 'subscription.js'
      : 'subscription.ts',
  ),

  apolloServerContext: async (subdomain, context) => {
    const models = await generateModels(subdomain, context);

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
    // await initMQWorkers(redis);
  },
  importExport: {
    import: {
      types: accountImportTypes,
      insertImportRows: createCoreModuleProducerHandler({
        moduleName: 'importExport',
        modules: { account: accountImportHandlers },
        methodName: TImportExportProducers.INSERT_IMPORT_ROWS,
        extractModuleName: (input: TInsertImportRowsInput) => input.moduleName,
        generateModels,
      }),
      getImportHeaders: createCoreModuleProducerHandler({
        moduleName: 'importExport',
        modules: { account: accountImportHandlers },
        methodName: TImportExportProducers.GET_IMPORT_HEADERS,
        extractModuleName: (input: TGetImportHeadersInput) => input.moduleName,
        generateModels,
      }),
      batchSkipRow: createCoreModuleProducerHandler({
        moduleName: 'importExport',
        modules: { account: accountImportHandlers },
        methodName: TImportExportProducers.BATCH_SKIP_ROW,
        extractModuleName: (input: TBatchSkipRowInput) => input.moduleName,
        generateModels,
      }),
    },
  },
  meta: {
    afterProcess,
    permissions,
  },
});
