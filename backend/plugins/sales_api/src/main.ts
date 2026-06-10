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
  TGetImportHeadersInput,
  TInsertImportRowsInput,
} from 'erxes-api-shared/core-modules';
import { posExportHandlers } from './modules/pos/meta/export/exportHandlers';
import { posImportHandlers } from './modules/pos/meta/import/importHandlers';
import { dealExportHandlers } from './modules/sales/meta/import-export/export/exportHandlers';
import { dealImportHandlers } from './modules/sales/meta/import-export/import/importHandlers';
import { permissions } from '~/meta/permissions';
import { salesReferences } from './meta/references';

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
    references: salesReferences,
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
      transactionCallback: async () => {
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
      import: {
        configured: true,
        hasGetImportHeaders: true,
        hasInsertImportRows: true,
        types: [
          {
            label: 'Deals',
            contentType: 'sales:deal.deals',
            permissions: ['dealsAdd'],
          },
          {
            label: 'POS Items',
            contentType: 'sales:pos.posItems',
            permissions: ['posOrderChangePayments'],
          },
        ],
      },
      export: {
        configured: true,
        hasGetExportHeaders: true,
        hasGetExportData: true,
        types: [
          {
            label: 'Deals',
            contentType: 'sales:deal.deals',
            permissions: ['showDeals'],
          },
          {
            label: 'POS Items',
            contentType: 'sales:pos.posItems',
            permissions: ['posOrderRead'],
          },
        ],
      },
    },
    permissions,
  } as any,
  importExport: {
    import: {
      types: [
        {
          label: 'Deals',
          contentType: 'sales:deal.deals',
          permissions: ['dealsAdd'],
        },
        {
          label: 'POS Items',
          contentType: 'sales:pos.posItems',
          permissions: ['posOrderChangePayments'],
        },
      ],
      getImportHeaders: createCoreModuleProducerHandler({
        moduleName: 'importExport',
        modules: { deal: dealImportHandlers, pos: posImportHandlers },
        methodName: TImportExportProducers.GET_IMPORT_HEADERS,
        extractModuleName: (input: TGetImportHeadersInput) => input.moduleName,
        generateModels,
      }),
      insertImportRows: createCoreModuleProducerHandler({
        moduleName: 'importExport',
        modules: { deal: dealImportHandlers, pos: posImportHandlers },
        methodName: TImportExportProducers.INSERT_IMPORT_ROWS,
        extractModuleName: (input: TInsertImportRowsInput) => input.moduleName,
        generateModels,
      }),
    },
    export: {
      types: [
        {
          label: 'Deals',
          contentType: 'sales:deal.deals',
          permissions: ['showDeals'],
        },
        {
          label: 'POS Items',
          contentType: 'sales:pos.posItems',
          permissions: ['posOrderRead'],
        },
      ],
      getExportHeaders: createCoreModuleProducerHandler({
        moduleName: 'importExport',
        modules: { deal: dealExportHandlers, pos: posExportHandlers },
        methodName: TImportExportProducers.GET_EXPORT_HEADERS,
        extractModuleName: (input: TGetExportHeadersInput) => input.moduleName,
        generateModels,
      }),
      getExportData: createCoreModuleProducerHandler({
        moduleName: 'importExport',
        modules: { deal: dealExportHandlers, pos: posExportHandlers },
        methodName: TImportExportProducers.GET_EXPORT_DATA,
        extractModuleName: (input: TGetExportDataInput) => input.moduleName,
        generateModels,
      }),
    },
  },
});
