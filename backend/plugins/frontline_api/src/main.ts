import initCallApp from '@/integrations/call/initApp';
// import { initWebsocketService } from '@/integrations/call/webSocket';
import onServerInitImap from '@/integrations/imap/initApp';
import { startPlugin } from 'erxes-api-shared/utils';
import {
  createCoreModuleProducerHandler,
  TImportExportProducers,
  TInsertImportRowsInput,
  TGetExportDataInput,
  TGetExportHeadersInput,
  TGetImportHeadersInput,
} from 'erxes-api-shared/core-modules';
import { typeDefs } from '~/apollo/typeDefs';
import { appRouter } from '~/init-trpc';
import { afterProcess } from '~/meta/afterProcess';
import { router } from '~/routes';
import resolvers from './apollo/resolvers';
import { generateModels } from './connectionResolvers';
import automations from './meta/automations';
import { notifications } from './meta/notifications';
import { ticketImportHandlers } from './meta/import-export/import/importHandlers';
import { ticketExportHandlers } from './meta/import-export/export/exportHandlers';

const ticketImportExportTypes = [
  {
    label: 'Ticket',
    contentType: 'frontline:ticket.ticket',
  },
];

startPlugin({
  name: 'frontline',
  port: 3304,
  graphql: async () => ({
    typeDefs: await typeDefs(),
    resolvers,
  }),

  hasSubscriptions: true,
  subscriptionPluginPath: require('path').resolve(
    __dirname,
    'apollo',
    process.env.NODE_ENV === 'production'
      ? 'subscription.js'
      : 'subscription.ts',
  ),

  expressRouter: router,
  onServerInit: async (app) => {
    await initCallApp(app);
    await onServerInitImap(app);
    // const CALL_WS_SERVER = getEnv({ name: 'CALL_WS_SERVER' });
    // if (CALL_WS_SERVER) {
    //   await initWebsocketService();
    // }
  },

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

  importExport: {
    import: {
      types: ticketImportExportTypes,
      insertImportRows: createCoreModuleProducerHandler({
        moduleName: 'importExport',
        modules: { ticket: ticketImportHandlers },
        methodName: TImportExportProducers.INSERT_IMPORT_ROWS,
        extractModuleName: (input: TInsertImportRowsInput) => input.moduleName,
        generateModels,
      }),
      getImportHeaders: createCoreModuleProducerHandler({
        moduleName: 'importExport',
        modules: { ticket: ticketImportHandlers },
        methodName: TImportExportProducers.GET_IMPORT_HEADERS,
        extractModuleName: (input: TGetImportHeadersInput) => input.moduleName,
        generateModels,
      }),
    },
    export: {
      types: ticketImportExportTypes,
      getExportData: createCoreModuleProducerHandler({
        moduleName: 'importExport',
        modules: { ticket: ticketExportHandlers },
        methodName: TImportExportProducers.GET_EXPORT_DATA,
        extractModuleName: (input: TGetExportDataInput) => input.moduleName,
        generateModels,
      }),
      getExportHeaders: createCoreModuleProducerHandler({
        moduleName: 'importExport',
        modules: { ticket: ticketExportHandlers },
        methodName: TImportExportProducers.GET_EXPORT_HEADERS,
        extractModuleName: (input: TGetExportHeadersInput) => input.moduleName,
        generateModels,
      }),
    },
  },

  meta: {
    automations,
    afterProcess,
    notifications,
    tags: {
      types: [
        {
          description: 'Inbox',
          type: 'conversation',
        },
        {
          description: 'Ticket',
          type: 'ticket',
        },
        {
          description: 'Form',
          type: 'form',
        },
      ],
    },
    properties: {
      types: [
        {
          description: 'Inbox',
          type: 'conversation',
        },
        {
          description: 'Tickets',
          type: 'ticket',
        },
      ],
    },
  },
});
