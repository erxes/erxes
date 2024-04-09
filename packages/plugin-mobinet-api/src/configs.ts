import { getSubdomain } from '@erxes/api-utils/src/core';
import app from '@erxes/api-utils/src/app';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as path from 'path';

import { generateModels } from './connectionResolver';
import documents from './documents';
import resolvers from './graphql/resolvers';
import typeDefs from './graphql/typeDefs';
import { setupMessageConsumers } from './messageBroker';
import cpUserMiddleware from './middlewares/cpUserMiddleware';
import internalNotes from './internalNotes';
import aftermutations from './aftermutations';
import forms from './forms';
import { getBuildingsByBounds } from './utils';


export default {
  name: 'mobinet',
  meta: {
    documents,
    internalNotes,
    aftermutations,
    forms,
  },

  getHandlers: [{ path: `/buildings`, method: getBuildingsByBounds }],

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


    app.use('/static', express.static(path.join(__dirname, '/public')));
  },
  setupMessageConsumers,
};
