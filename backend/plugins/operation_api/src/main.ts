import { redis, startPlugin } from 'erxes-api-shared/utils';
import { Router } from 'express';
import { typeDefs } from '~/apollo/typeDefs';
import { initMQWorkers } from '~/worker';
import resolvers from './apollo/resolvers';
import { generateModels } from './connectionResolvers';
import * as trpc from './trpc/init-trpc';
import { permissions } from './meta/permissions';
import { notifications } from './meta/notifications';
import {
  createCoreModuleProducerHandler,
  TImportExportProducers,
  TGetExportDataInput,
  TGetExportHeadersInput,
} from 'erxes-api-shared/core-modules';
import { taskExportHandlers } from './modules/task/meta/import-export/export/exportHandlers';
import { projectExportHandlers } from './modules/project/meta/import-export/export/exportHandlers';

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
    export: {
      types: [
        {
          label: 'Task',
          contentType: 'operation:task.tasks',
        },
        {
          label: 'Project',
          contentType: 'operation:project.projects',
        },
      ],
      getExportHeaders: createCoreModuleProducerHandler({
        moduleName: 'importExport',
        modules: {
          tasks: taskExportHandlers,
          projects: projectExportHandlers,
        },
        methodName: TImportExportProducers.GET_EXPORT_HEADERS,
        extractModuleName: (input: any) => input.collectionName || 'tasks',
        generateModels,
      }),
      getExportData: createCoreModuleProducerHandler({
        moduleName: 'importExport',
        modules: {
          tasks: taskExportHandlers,
          projects: projectExportHandlers,
        },
        methodName: TImportExportProducers.GET_EXPORT_DATA,
        extractModuleName: (input: any) => input.collectionName || 'tasks',
        generateModels,
      }),
    },
  },

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
  },
});
