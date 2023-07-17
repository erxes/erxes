import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { initBroker } from './messageBroker';
import init from './controller';
import { DiscordBot } from './bot';

export let mainDb;
export let graphqlPubsub;
export let serviceDiscovery;

export let debug;

export default {
  name: 'discord',
  graphql: sd => {
    serviceDiscovery = sd;
    return {
      typeDefs,
      resolvers
    };
  },
  meta: {
    inboxIntegration: {
      kind: 'discord',
      label: 'Discord'
    }
  },
  apolloServerContext: async context => {
    return context;
  },

  onServerInit: async options => {
    const app = options.app;
    mainDb = options.db;

    debug = options.debug;
    graphqlPubsub = options.pubsubClient;

    const bot = new DiscordBot();

    await initBroker(options.messageBrokerClient, bot);

    init(app);

    bot.login();
  }
};
