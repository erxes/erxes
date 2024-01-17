import { getSubdomain } from '@erxes/api-utils/src/core';
import * as cookieParser from 'cookie-parser';

import { generateModels } from './connectionResolver';
import documents from './documents';
import resolvers from './graphql/resolvers';
import typeDefs from './graphql/typeDefs';
import { initBroker } from './messageBroker';
import cpUserMiddleware from './middlewares/cpUserMiddleware';
import internalNotes from './internalNotes';

export let mainDb;
export let debug;



export default {
  name: 'mobinet',
  meta: {
    documents,
    internalNotes
  },
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers()
    };
  },

  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    context.subdomain = subdomain;
    context.models = await generateModels(subdomain);
    return context;
  },

  middlewares: [cookieParser(), cpUserMiddleware],

  onServerInit: async options => {
    mainDb = options.db;

    initBroker(options.messageBrokerClient);

    

    debug = options.debug;
  }
};
