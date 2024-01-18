import { filterXSS } from 'xss';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';

import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers/index';
import { debugBase } from './debuggers';
import { initBroker } from './messageBroker';
import { generateModels } from './connectionResolver';
import { getSubdomain } from '@erxes/api-utils/src/core';
import * as permissions from './permissions';
import app from '@erxes/api-utils/src/app';

export let mainDb;
export let debug;

export default {
  name: 'exm',
  permissions,
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers,
    };
  },
  segment: { schemas: [] },
  hasSubscriptions: false,
  meta: {},
  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    context.dataloaders = {};
    context.docModifier = (doc) => doc;

    context.models = await generateModels(subdomain);
    context.subdomain = subdomain;

    return context;
  },
  onServerInit: async (options) => {
    mainDb = options.db;

    // Error handling middleware
    app.use((error, _req, res, _next) => {
      const msg = filterXSS(error.message);

      debugBase(`Error: ${msg}`);
      res.status(500).send(msg);
    });

    initBroker(options.messageBrokerClient);

    debug = options.debug;
  },
};
