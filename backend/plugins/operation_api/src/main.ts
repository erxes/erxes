import { redis, startPlugin } from 'erxes-api-shared/utils';
import { Router } from 'express';
import { typeDefs } from '~/apollo/typeDefs';
import { initMQWorkers } from '~/worker';
import resolvers from './apollo/resolvers';
import { generateModels } from './connectionResolvers';
import * as trpc from './trpc/init-trpc';
import { permissions } from './meta/permissions';

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
    notificationModules: [
      {
        name: 'tasks',
        description: 'Tasks',
        icon: 'IconChecklist',
        types: [
          { name: 'taskAssignee', text: 'Task assignee' },
          { name: 'taskStatus', text: 'Task status changed' },
        ],
      },
      {
        name: 'projects',
        description: 'Projects',
        icon: 'IconClipboard',
        types: [
          { name: 'projectAssignee', text: 'Project assignee' },
          { name: 'projectStatus', text: 'Project status changed' },
        ],
      },
      {
        name: 'note',
        description: 'Note',
        icon: 'IconNote',
        types: [{ name: 'note', text: 'Mentioned in note' }],
      },
    ],
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
