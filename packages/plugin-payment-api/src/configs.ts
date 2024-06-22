import app from '@erxes/api-utils/src/app';
import { getSubdomain } from '@erxes/api-utils/src/core';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as path from 'path';

import { PAYMENTS } from './api/constants';
import { generateModels } from './connectionResolver';
import controllers from './controllers';
import resolvers from './graphql/resolvers';
import typeDefs from './graphql/typeDefs';
import { setupMessageConsumers } from './messageBroker';
import * as permissions from './permissions';
import { callbackHandler } from './utils';

import cookieParser = require('cookie-parser')
import i18n = require('i18n');

export default {
  name: 'payment',
  permissions,
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
    };
  },

  hasSubscriptions: true,
  subscriptionPluginPath: require('path').resolve(
    __dirname,
    'graphql',
    'subscriptionPlugin.js',
  ),
  meta: {
    permissions,
  },

  getHandlers: PAYMENTS.ALL.map((type) => ({
    path: `/callback/${type}`,
    method: callbackHandler,
  })),

  postHandlers: PAYMENTS.ALL.map((type) => ({
    path: `/callback/${type}`,
    method: callbackHandler,
  })),

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

    return context;
  },

  middlewares: [cookieParser(), bodyParser.json()],

  onServerInit: async () => {
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'pug');

    // serve static files
    app.use('/static', express.static(path.join(__dirname, '/public')));

    // generated scripts
    app.use('/build', express.static(path.join(__dirname, '../static')));

    i18n.configure({
      locales: ['en', 'mn'],
      queryParameter: 'lang',
      directory: __dirname + '/locales',
      defaultLocale: 'en',
      autoReload: false,
      updateFiles: false,
    });

    app.use(i18n.init);

    app.use((req, _res, next) => {
      const locale = req.query.lang || 'en';

      i18n.setLocale(locale);

      next();
    });

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.use(controllers);
  },
  setupMessageConsumers,
};
