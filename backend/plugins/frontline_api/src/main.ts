import initCallApp from '@/integrations/call/initApp';
import { initWebsocketService } from '@/integrations/call/webSocket';
import onServerInitImap from '@/integrations/imap/initApp';
import { getEnv, startPlugin } from 'erxes-api-shared/utils';
import { typeDefs } from '~/apollo/typeDefs';
import { appRouter } from '~/init-trpc';
import { afterProcess } from '~/meta/afterProcess';
import { router } from '~/routes';
import resolvers from './apollo/resolvers';
import { generateModels } from './connectionResolvers';
import automations from './meta/automations';

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
    // await initCallApp(app);
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

  meta: {
    automations,
    afterProcess,
    notificationModules: [
      {
        name: 'conversations',
        description: 'Conversations',
        icon: 'IconComment',
        types: [
          { name: 'conversationAddMessage', text: 'Message added' },
          { name: 'conversationAssigneeChange', text: 'Assignee changed' },
          { name: 'conversationCreated', text: 'Conversation created' },
          { name: 'conversationParticipantAdded', text: 'Participant added' },
          { name: 'conversationStateChange', text: 'State changed' },
          { name: 'conversationTagged', text: 'Conversation tagged' },
        ],
      },
      {
        name: 'channels',
        description: 'Channels',
        icon: 'IconDeviceLaptop',
        types: [
          {
            name: 'channelMembersChange',
            text: 'Assignee change',
          },
        ],
      },
    ],
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
