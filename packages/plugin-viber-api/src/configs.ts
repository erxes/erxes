import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { setupMessageConsumers } from './messageBroker';
import init from './controller';
import webhookListen from './viber/webhookListen';
import { getSubdomainHeader } from '@erxes/api-utils/src/headers';

export default {
  name: 'viber',
  graphql: () => {
    return {
      typeDefs,
      resolvers,
    };
  },
  meta: {
    inboxIntegrations: [
      {
        kind: 'viber',
        label: 'Viber',
      },
    ],
  },

  postHandlers: [{ path: '/webhook/:integrationId', method: webhookListen }],

  apolloServerContext: async (context, req): Promise<any> => {
    const subdomain: string = getSubdomainHeader(req);

    return context;
  },

  onServerInit: async () => {
    init();
  },
  setupMessageConsumers,
};
