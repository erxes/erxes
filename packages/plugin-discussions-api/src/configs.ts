import * as cookieParser from 'cookie-parser';
import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { generateModels } from './connectionResolver';
import { setupMessageConsumers } from './messageBroker';
import cpUserMiddleware from './middlewares/cpUserMiddleware';

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
    const { subdomain } = context;

    context.cpUser = req.cpUser;

    context.models = await generateModels(subdomain);
  },

  middlewares: [cookieParser(), cpUserMiddleware],

  onServerInit: async () => {},
  setupMessageConsumers,
};
