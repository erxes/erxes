import initCallApp from '@/integrations/call/initApp';
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
import { automations } from './meta/automations';
import { notifications } from './meta/notifications';
import { permissions } from './meta/permissions';
import { ticketImportHandlers } from './meta/import-export/import/importHandlers';
import {
  ticketExportHandlers,
  formSubmissionExportHandlers,
} from './meta/import-export/export/exportHandlers';
import { frontlineReferences } from './meta/references';
import segments from './meta/segments';

const ticketImportTypes = [
  {
    label: 'Ticket',
    contentType: 'frontline:ticket.ticket',
    permissions: ['ticketsImportManage'],
  },
];

const ticketExportTypes = [
  {
    label: 'Ticket',
    contentType: 'frontline:ticket.ticket',
    permissions: ['ticketsExportManage'],
  },
];

const formSubmissionExportTypes = [
  {
    label: 'Form Response',
    contentType: 'frontline:formSubmission.formSubmission',
    permissions: ['formSubmissionsExportManage'],
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
      types: ticketImportTypes,
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
      types: [...ticketExportTypes, ...formSubmissionExportTypes],
      getExportData: createCoreModuleProducerHandler({
        moduleName: 'importExport',
        modules: {
          ticket: ticketExportHandlers,
          formSubmission: formSubmissionExportHandlers,
        },
        methodName: TImportExportProducers.GET_EXPORT_DATA,
        extractModuleName: (input: TGetExportDataInput) => input.moduleName,
        generateModels,
      }),
      getExportHeaders: createCoreModuleProducerHandler({
        moduleName: 'importExport',
        modules: {
          ticket: ticketExportHandlers,
          formSubmission: formSubmissionExportHandlers,
        },
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
    permissions,
    references: frontlineReferences,
    segments,
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
