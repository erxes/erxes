import { redis, startPlugin } from 'erxes-api-shared/utils';
import { typeDefs } from '~/apollo/typeDefs';
import resolvers from './apollo/resolvers';
import { generateModels } from './connectionResolvers';
import { Router } from 'express';
import { initMQWorkers } from '~/worker';

export const router: Router = Router();

startPlugin({
  name: 'operation',
  port: 3306,
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
    const models = await generateModels(subdomain);

    context.models = models;

    return context;
  },
  onServerInit: async () => {
    await initMQWorkers(redis);
  },

  expressRouter: router,

  meta: {
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
  },
});
