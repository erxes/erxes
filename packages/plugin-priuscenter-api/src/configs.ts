import * as cookieParser from 'cookie-parser';
import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { initBroker } from './messageBroker';
import * as permissions from './permissions';
import cpUserMiddleware from './middlewares/cpUserMiddleware';

export let mainDb;
export let debug;



export default {
  name: 'priuscenter',
  permissions,
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers()
    };
  },

  apolloServerContext: async (context, req, res) => {
    if (req.cpUser) {
      context.cpUser = req.cpUser;
    }

    return context;
  },

  middlewares: [cookieParser(), cpUserMiddleware],

  onServerInit: async options => {
    mainDb = options.db;

    initBroker(options.messageBrokerClient);

    

    debug = options.debug;
  }
};
