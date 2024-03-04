import * as cookieParser from 'cookie-parser';
import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { generateModels } from './connectionResolver';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { setupMessageConsumers } from './messageBroker';
import cpUserMiddleware from './middlewares/cpUserMiddleware';
import * as permissions from './permissions';
import * as customCommand from './customCommand';



export default {
  name: 'apex',
  permissions,
  graphql: () => {
    return {
      typeDefs,
      resolvers
    };
  },
  hasSubscriptions: true,
  segment: {},
  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    if (req.cpUser) {
      context.cpUser = req.cpUser;
    }

    context.subdomain = subdomain;
    context.models = await generateModels(subdomain);

    return context;
  },

  middlewares: [cookieParser(), cpUserMiddleware],

  onServerInit: async () => {
  },
  setupMessageConsumers
};
