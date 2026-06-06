import { redis, startPlugin } from 'erxes-api-shared/utils';
import {
  createCoreModuleProducerHandler,
  TImportExportProducers,
  TGetExportDataInput,
  TGetExportHeadersInput,
  TGetImportHeadersInput,
  TInsertImportRowsInput,
} from 'erxes-api-shared/core-modules';
import { Router } from 'express';
import { typeDefs } from '~/apollo/typeDefs';
import { initMQWorkers } from '~/worker';
import resolvers from './apollo/resolvers';
import { generateModels } from './connectionResolvers';
import * as trpc from './trpc/init-trpc';
import { permissions } from './meta/permissions';
import { notifications } from './meta/notifications';
import { operationImportHandlers } from './meta/import-export/importHandlers';
import { operationExportHandlers } from './meta/import-export/exportHandlers';

export const router: Router = Router();

startPlugin({
  name: 'operation',
  port: 3307,
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
  apolloServerContext: async (subdomain, context) => {
    const models = await generateModels(subdomain, context);

    context.models = models;

    return context;
  },
  trpcAppRouter: {
    router: trpc.appRouter,
    createContext: async (subdomain, context) => {
      const models = await generateModels(subdomain);
      context.models = models;
      return context;
    },
  },
  onServerInit: async () => {
    await initMQWorkers(redis);
  },

  expressRouter: router,

  meta: {
    permissions,
    notifications,
    tags: {
      types: [
        {
          description: 'Task',
          type: 'task',
        },
        {
          description: 'Project',
          type: 'project',
        },
      ],
    },
    importExport: {
      import: {
        configured: true,
        hasGetImportHeaders: true,
        hasInsertImportRows: true,
        types: [
          { label: 'Task', contentType: 'operation:task.task' },
          { label: 'Project', contentType: 'operation:project.project' },
        ],
      },
      export: {
        configured: true,
        hasGetExportHeaders: true,
        hasGetExportData: true,
        types: [
          { label: 'Task', contentType: 'operation:task.task' },
          { label: 'Project', contentType: 'operation:project.project' },
        ],
      },
    },
  } as any,
  importExport: {
    import: {
      types: [
        { label: 'Task', contentType: 'operation:task.task' },
        { label: 'Project', contentType: 'operation:project.project' },
      ],
      getImportHeaders: createCoreModuleProducerHandler({
        moduleName: 'importExport',
        modules: {
          task: operationImportHandlers,
          project: operationImportHandlers,
        },
        methodName: TImportExportProducers.GET_IMPORT_HEADERS,
        extractModuleName: (input: TGetImportHeadersInput) => input.moduleName,
        generateModels,
      }),
      insertImportRows: createCoreModuleProducerHandler({
        moduleName: 'importExport',
        modules: {
          task: operationImportHandlers,
          project: operationImportHandlers,
        },
        methodName: TImportExportProducers.INSERT_IMPORT_ROWS,
        extractModuleName: (input: TInsertImportRowsInput) => input.moduleName,
        generateModels,
      }),
    },
    export: {
      types: [
        { label: 'Task', contentType: 'operation:task.task' },
        { label: 'Project', contentType: 'operation:project.project' },
      ],
      getExportHeaders: createCoreModuleProducerHandler({
        moduleName: 'importExport',
        modules: {
          task: operationExportHandlers,
          project: operationExportHandlers,
        },
        methodName: TImportExportProducers.GET_EXPORT_HEADERS,
        extractModuleName: (input: TGetExportHeadersInput) => input.moduleName,
        generateModels,
      }),
      getExportData: createCoreModuleProducerHandler({
        moduleName: 'importExport',
        modules: {
          task: operationExportHandlers,
          project: operationExportHandlers,
        },
        methodName: TImportExportProducers.GET_EXPORT_DATA,
        extractModuleName: (input: TGetExportDataInput) => input.moduleName,
        generateModels,
      }),
    },
  },
});
