import { appRouter } from './trpc/init-trpc';
import automations from './meta/automations';
import { generateModels } from './connectionResolvers';
import resolvers from './apollo/resolvers';
import { router } from './routes';
import segments from './meta/segments';
import { sendTRPCMessage, startPlugin } from 'erxes-api-shared/utils';
import { afterProcess } from '~/meta/afterProcess';
import { typeDefs } from './apollo/typeDefs';
import { createLoaders } from './modules/sales/graphql/resolvers/loaders';
import { notifications } from './meta/notifications';
import { subscriptionWrapper } from '~/modules/sales/graphql/resolvers/utils';
import {
  createCoreModuleProducerHandler,
  TImportExportProducers,
  TGetExportDataInput,
  TGetExportHeadersInput,
} from 'erxes-api-shared/core-modules';
import { posExportHandlers } from './modules/pos/meta/export/exportHandlers';
import { permissions } from '~/meta/permissions';
import { salesReferences } from './meta/references';

const handleDealPaymentCallback = async (subdomain: string, data: any) => {
  const { contentTypeId, amount = 0, _id } = data;
  const paidAmount = Number(amount || 0);
  const models = await generateModels(subdomain);
  const oldDeal = await models.Deals.getDeal(contentTypeId);

  const updateResult = await models.Deals.updateOne(
    { _id: contentTypeId, 'mobileAmounts._id': { $ne: _id } },
    {
      $addToSet: {
        mobileAmounts: {
          _id,
          amount: paidAmount,
        },
      },
      $inc: {
        mobileAmount: paidAmount,
      },
    },
  );

  if (!updateResult.modifiedCount) {
    return;
  }

  const updatedDeal = await models.Deals.getDeal(contentTypeId);

  await subscriptionWrapper(models, {
    action: 'update',
    deal: updatedDeal,
    oldDeal,
  });
};

const handlePosOrderPaymentCallback = async (subdomain: string, data: any) => {
  const posToken = data?.data?.posToken;

  if (!posToken) {
    return;
  }

  await sendTRPCMessage({
    subdomain,
    pluginName: 'posclient',
    method: 'query',
    module: 'posclient',
    action: 'paymentCallbackClient',
    input: data,
    defaultValue: null,
  });
};

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
        const { status, contentType } = data;

        if (status !== 'paid') {
          return;
        }

        if (contentType === 'sales:deal') {
          return handleDealPaymentCallback(subdomain, data);
        }

        if (
          [
            'pos:orders',
            'pos:order',
            'pos:orders:',
            'sales:pos:orders',
            'sales:pos:order',
          ].includes(contentType)
        ) {
          return handlePosOrderPaymentCallback(subdomain, data);
        }
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
            permissions: ['posItemsExportManage'],
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
          permissions: ['posItemsExportManage'],
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
