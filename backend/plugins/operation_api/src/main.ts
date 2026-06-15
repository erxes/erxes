import { redis, startPlugin } from 'erxes-api-shared/utils';
import { Router } from 'express';
import { typeDefs } from '~/apollo/typeDefs';
import { initMQWorkers } from '~/worker';
import resolvers from './apollo/resolvers';
import { generateModels } from './connectionResolvers';
import * as trpc from './trpc/init-trpc';
import { permissions } from './meta/permissions';
import { notifications } from './meta/notifications';
import { automations } from './meta/automations';
import segments from './meta/segments';
import {
  createCoreModuleProducerHandler,
  TImportExportProducers,
  TGetExportDataInput,
  TGetExportHeadersInput,
  TInsertImportRowsInput,
  TGetImportHeadersInput,
} from 'erxes-api-shared/core-modules';
import {
  taskExportHandlers,
  projectExportHandlers,
} from './meta/import-export/export/exportHandlers';
import { taskImportHandlers } from './meta/import-export/import/importHandlers';

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

  importExport: {
    import: {
      types: [
        {
          label: 'Task',
          contentType: 'operation:task.task',
          permissions: ['taskImportManage'],
        },
      ],
      insertImportRows: createCoreModuleProducerHandler({
        moduleName: 'importExport',
        modules: { task: taskImportHandlers },
        methodName: TImportExportProducers.INSERT_IMPORT_ROWS,
        extractModuleName: (input: TInsertImportRowsInput) => input.moduleName,
        generateModels,
      }),
      getImportHeaders: createCoreModuleProducerHandler({
        moduleName: 'importExport',
        modules: { task: taskImportHandlers },
        methodName: TImportExportProducers.GET_IMPORT_HEADERS,
        extractModuleName: (input: TGetImportHeadersInput) => input.moduleName,
        generateModels,
      }),
    },
    export: {
      types: [
        {
          label: 'Task',
          contentType: 'operation:task.task',
          permissions: ['taskExportManage'],
        },
        {
          label: 'Project',
          contentType: 'operation:project.project',
          permissions: ['projectExportManage'],
        },
      ],
      getExportData: createCoreModuleProducerHandler({
        moduleName: 'importExport',
        modules: {
          task: taskExportHandlers,
          project: projectExportHandlers,
        },
        methodName: TImportExportProducers.GET_EXPORT_DATA,
        extractModuleName: (input: TGetExportDataInput) => input.moduleName,
        generateModels,
      }),
      getExportHeaders: createCoreModuleProducerHandler({
        moduleName: 'importExport',
        modules: {
          task: taskExportHandlers,
          project: projectExportHandlers,
        },
        methodName: TImportExportProducers.GET_EXPORT_HEADERS,
        extractModuleName: (input: TGetExportHeadersInput) => input.moduleName,
        generateModels,
      }),
    },
  },

  meta: {
    automations,
    permissions,
    notifications,
    segments,
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
    properties: {
      types: [
        {
          description: 'Tasks',
          type: 'task',
        },
        {
          description: 'Projects',
          type: 'project',
        },
      ],
    },
  },
});
