import { appRouter } from './trpc/init-trpc';
import automations from './meta/automations';
import { generateModels } from './connectionResolvers';
import resolvers from './apollo/resolvers';
import { router } from './routes';
import segments from './meta/segments';
import { startPlugin } from 'erxes-api-shared/utils';
import { afterProcess } from '~/meta/afterProcess';
import { typeDefs } from './apollo/typeDefs';
import { createLoaders } from './modules/sales/graphql/resolvers/loaders';
import { notifications } from './meta/notifications';
import {
  createCoreModuleProducerHandler,
  TImportExportProducers,
  TGetExportDataInput,
  TGetExportHeadersInput,
} from 'erxes-api-shared/core-modules';
import { posExportHandlers } from './modules/pos/meta/export/exportHandlers';
import { permissions } from '~/meta/permissions';

startPlugin({
  name: 'sales',
  port: 3305,
  graphql: async () => ({
    typeDefs: await typeDefs(),
    resolvers,
  }),
  expressRouter: router,
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
    context.loaders = createLoaders(subdomain, models);

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
  meta: {
    automations,
    segments,
    tags: { types: [{ type: 'deal', description: 'Sales' }] },
    properties: {
      types: [
        {
          description: 'Sales pipelines',
          type: 'deal',
        },
      ],
    },
    notifications,
    payments: {
      transactionCallback: async (subdomain, data) => {
        // TODO: implement transaction callback if necessary
      },
      callback: async ({ subdomain }, data) => {
        const {
          status,
          contentType,
          contentTypeId,
          amount = 0,
          _id,
          currency,
        } = data;

        if (contentType !== 'sales:deal') {
          return;
        }
        if (status !== 'paid') {
          return;
        }

        const models = await generateModels(subdomain);
        const deal = await models.Deals.getDeal(contentTypeId);
        const oldPaymentsData = deal.paymentsData || {};
        const bankData = oldPaymentsData.bank || { info: {} };

        bankData.info = bankData.info || {};

        const oldInfo = (bankData.info.invoices || []).find(
          (invoice) => invoice._id === _id,
        );
        const newAmount =
          (bankData.amount || 0) - (oldInfo?.amount || 0) + amount;

        bankData.amount = newAmount <= 0 ? 0 : newAmount;
        bankData.currency = currency || 'MNT';
        bankData.info.invoices = [
          ...(bankData.info.invoices || []).filter(
            (invoice) => invoice._id !== _id,
          ),
          {
            _id,
            amount,
          },
        ];

        await models.Deals.updateOne(
          { _id: contentTypeId },
          {
            $set: {
              paymentsData: {
                ...oldPaymentsData,
                bank: bankData,
              },
            },
          },
        );
      },
    },
    afterProcess,
    importExport: {
      export: {
        configured: true,
        hasGetExportHeaders: true,
        hasGetExportData: true,
        types: [
          {
            label: 'POS Items',
            contentType: 'sales:pos.posItems',
          },
        ],
      },
    },
    permissions,
  } as any,
  importExport: {
    export: {
      types: [
        {
          label: 'POS Items',
          contentType: 'sales:pos.posItems',
        },
      ],
      getExportHeaders: createCoreModuleProducerHandler({
        moduleName: 'importExport',
        modules: { pos: posExportHandlers },
        methodName: TImportExportProducers.GET_EXPORT_HEADERS,
        extractModuleName: (input: TGetExportHeadersInput) => input.moduleName,
        generateModels,
      }),
      getExportData: createCoreModuleProducerHandler({
        moduleName: 'importExport',
        modules: { pos: posExportHandlers },
        methodName: TImportExportProducers.GET_EXPORT_DATA,
        extractModuleName: (input: TGetExportDataInput) => input.moduleName,
        generateModels,
      }),
    },
  },
});
