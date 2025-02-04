import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { setupMessageConsumers } from './messageBroker';
import { generateModels } from './connectionResolver';
import { getSubdomain } from '@erxes/api-utils/src/core';
import * as session from 'express-session';
import app from '@erxes/api-utils/src/app';
import * as permissions from './permissions';
import forms from './forms';
import clientPortalMiddleware from './clientPortalMiddleware';

export default {
  name: 'cms',
  permissions,
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
    };
  },
  meta: {
    permissions,
    forms,
  },

  middlewares: [clientPortalMiddleware],

  apolloServerContext: async (context, req, res) => {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    const requestInfo = {
      secure: req.secure,
      cookies: req.cookies,
      headers: req.headers,
    };

    context.subdomain = subdomain;
    context.models = models;

    context.requestInfo = requestInfo;
    context.res = res;
    context.session = req.session;

    if (req.clientPortalId) {
      context.clientPortalId = req.clientPortalId;
    }

    return context;
  },

  onServerInit: async () => {
    app.use(
      session({
        name: 'erxes-session',
        secret: process.env.SESSION_SECRET || 'erxes',
        resave: false,
        saveUninitialized: false,
        cookie: {
          httpOnly: true,
          maxAge: 1000 * 60 * 60 * 24,
          secure: process.env.NODE_ENV === 'production',
        },
      })
    );
  },
  setupMessageConsumers,
};
