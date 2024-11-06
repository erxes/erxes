import * as cookieParser from 'cookie-parser';
import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { generateModels } from './connectionResolver';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { setupMessageConsumers } from './messageBroker';
import cpUserMiddleware from "@erxes/api-utils/src/middlewares/clientportal";

export default {
  name: 'discussions',
  graphql: () => {
    return {
      typeDefs,
      resolvers,
    };
  },
  segment: {},
  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    context.cpUser = req.cpUser;
    context.subdomain = subdomain;
    context.models = await generateModels(subdomain);
  },

  middlewares: [cookieParser(), cpUserMiddleware],

  onServerInit: async () => {},
  setupMessageConsumers,
};
