import { getSubdomain } from '@erxes/api-utils/src/core';
import * as express from 'express';
import * as path from 'path';
import * as permissions from './permissions';
import { generateModels } from './connectionResolver';
import { GET_CALLBACK_TYPES, POST_CALLBACK_TYPES } from './constants';
import controllers from './controllers';
import resolvers from './graphql/resolvers';
import typeDefs from './graphql/typeDefs';
import { initBroker } from './messageBroker';
import { getHandler, postHandler } from './utils';
import i18n = require('i18n');

export let mainDb;
export let debug;
export let graphqlPubsub;
export let serviceDiscovery;

export default {
  name: 'payment',
  permissions,
  graphql: async sd => {
    serviceDiscovery = sd;

    return {
      typeDefs: await typeDefs(sd),
      resolvers: await resolvers(sd)
    };
  },

  hasSubscriptions: true,
  meta: {
    permissions
  },

  getHandlers: GET_CALLBACK_TYPES.ALL.map(type => ({
    path: `/callback/${type}`,
    method: getHandler
  })),

  postHandlers: POST_CALLBACK_TYPES.ALL.map(type => ({
    path: `/callback/${type}`,
    method: postHandler
  })),

  apolloServerContext: async (context, req, res) => {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    const requestInfo = {
      secure: req.secure,
      cookies: req.cookies,
      headers: req.headers
    };

    context.subdomain = subdomain;
    context.models = models;

    context.requestInfo = requestInfo;
    context.res = res;

    return context;
  },

  onServerInit: async options => {
    mainDb = options.db;

    initBroker(options.messageBrokerClient);

    graphqlPubsub = options.pubsubClient;

    debug = options.debug;

    const { app } = options;

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
      defaultLocale: 'en'
    });

    app.use(i18n.init);

    app.use((req, _res, next) => {
      const locale = req.query.lang || 'en';

      i18n.setLocale(locale);

      next();
    });

    app.use(controllers);
  }
};
