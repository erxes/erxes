import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { initBroker } from './messageBroker';
import init from './controller';
import webhookListen from './viber/webhookListen';
import { getSubdomain } from '@erxes/api-utils/src/core';

export let mainDb;
export let debug;

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
    const subdomain: string = getSubdomain(req);
    context.subdomain = subdomain;
    return context;
  },

  onServerInit: async (options) => {
    mainDb = options.db;

    debug = options.debug;

    initBroker(options.messageBrokerClient);

    init();
  },
};
