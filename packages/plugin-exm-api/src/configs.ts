import { filterXSS } from 'xss';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';

import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers/index';
import { debugBase } from './debuggers';
import { setupMessageConsumers } from './messageBroker';
import { generateModels } from './connectionResolver';
import { getSubdomain } from '@erxes/api-utils/src/core';
import * as permissions from './permissions';
import app from '@erxes/api-utils/src/app';

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
  meta: { permissions },
  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    context.dataloaders = {};
    context.docModifier = (doc) => doc;

    context.models = await generateModels(subdomain);
    context.subdomain = subdomain;

    return context;
  },
  onServerInit: async () => {
    // Error handling middleware
    app.use((error, _req, res, _next) => {
      const msg = filterXSS(error.message);

      debugBase(`Error: ${msg}`);
      res.status(500).send(msg);
    });
  },
  setupMessageConsumers,
};
