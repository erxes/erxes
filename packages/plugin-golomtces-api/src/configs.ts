import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { initBroker } from './messageBroker';
import { generateExpiredToken } from './api';

export let mainDb;
export let graphqlPubsub;
export let serviceDiscovery;

export let debug;

export default {
  name: 'golomtces',
  graphql: sd => {
    serviceDiscovery = sd;
    return {
      typeDefs,
      resolvers
    };
  },

  postHandlers: [
    {
      path: `/token-by-user`,
      method: async (req, res) => {
        try {
          const response = await generateExpiredToken(req.body);
          return res.json(response);
        } catch (e) {
          console.error(e.message);
          return res.json({ error: e.message });
        }
      }
    },
    {
      path: `/hook-message`,
      method: async (req, res) => {
        try {
          const response = await generateExpiredToken(req.body);
          return res.json(response);
        } catch (e) {
          console.error(e.message);
          return res.json({ error: e.message });
        }
      }
    }
  ],
  apolloServerContext: async context => {
    return context;
  },

  onServerInit: async options => {
    mainDb = options.db;

    debug = options.debug;
    graphqlPubsub = options.pubsubClient;

    initBroker(options.messageBrokerClient);
  }
};
