import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { initBroker } from './messageBroker';
import webhookReceiver from './webhook';

export let mainDb;
export let debug;
export let graphqlPubsub;
export let serviceDiscovery;

export default {
  name: 'calls',
  hasSubscriptions: true,
  graphql: async sd => {
    serviceDiscovery = sd;

    return {
      typeDefs: await typeDefs(sd),
      resolvers: await resolvers(sd)
    };
  },

  meta: {
    inboxIntegrations: [
      {
        kind: 'calls',
        label: 'Phone call'
      }
    ]
  },

  postHandlers: [{ path: '/webhook', method: webhookReceiver }],

  apolloServerContext: async context => {
    return context;
  },

  onServerInit: async options => {
    mainDb = options.db;

    initBroker(options.messageBrokerClient);

    graphqlPubsub = options.pubsubClient;

    debug = options.debug;
  }
};
