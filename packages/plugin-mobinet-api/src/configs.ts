import { getSubdomain } from '@erxes/api-utils/src/core';
import * as cookieParser from 'cookie-parser';

import { generateModels } from './connectionResolver';
import documents from './documents';
import resolvers from './graphql/resolvers';
import typeDefs from './graphql/typeDefs';
import { setupMessageConsumers } from './messageBroker';
import cpUserMiddleware from './middlewares/cpUserMiddleware';
import internalNotes from './internalNotes';
import aftermutations from './aftermutations';
import forms from './forms';



export default {
  name: 'mobinet',
  meta: {
    documents,
    internalNotes,
    aftermutations,
    forms,
  },
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
    };
  },

  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    context.subdomain = subdomain;
    context.models = await generateModels(subdomain);
    return context;
  },

  middlewares: [cookieParser(), cpUserMiddleware],

  onServerInit: async () => {
  },
  setupMessageConsumers
};
