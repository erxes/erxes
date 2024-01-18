import typeDefs from './graphql/typeDefs';
import * as cors from 'cors';
import resolvers from './graphql/resolvers';
import { generateModels } from './connectionResolver';
import { initBroker } from './messageBroker';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { posInitialSetup } from './routes';
import * as cookieParser from 'cookie-parser';
import posUserMiddleware from './userMiddleware';
import posConfigMiddleware from './configMiddleware';
import * as dotenv from 'dotenv';
import { loadSubscriptions } from './subscriptions';

export let debug;

export let mainDb;

dotenv.config();

export default {
  name: 'posclient',
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
  freeSubscriptions: loadSubscriptions,

  getHandlers: [
    { path: `/initial-setup`, method: posInitialSetup },
    { path: `/pl:posclient/initial-setup`, method: posInitialSetup },
  ],

  apolloServerContext: async (context, req, res) => {
    const subdomain = getSubdomain(req);

    const requestInfo = {
      secure: req.secure,
      cookies: req.cookies,
      headers: req.headers,
    };

    const models = await generateModels(subdomain);

    context.subdomain = subdomain;
    context.models = models;

    context.requestInfo = requestInfo;
    context.res = res;

    context.config = {};

    if (req.posConfig && req.posConfig._id) {
      context.config = req.posConfig;
    } else {
      if (models) {
        if ((await models.Configs.find({}).count()) === 1) {
          context.config = await models.Configs.findOne({}).lean();
        }
      }
    }

    if (req.posUser) {
      context.posUser = req.posUser;
    }

    return context;
  },
  corsOptions: {
    credentials: true,
    origin: [
      ...(process.env.ALLOWED_ORIGINS || '')
        .split(',')
        .map((c) => c && RegExp(c)),
    ],
  },
  middlewares: [
    cookieParser(),
    posUserMiddleware,
    posConfigMiddleware,
    cors({
      credentials: true,
      origin: [
        ...(process.env.ALLOWED_ORIGINS || '')
          .split(',')
          .map((c) => c && RegExp(c)),
      ],
    }),
  ],

  onServerInit: async (options) => {
    mainDb = options.db;

    initBroker(options.messageBrokerClient);

    debug = options.debug;
  },

  reconnectRMQ: async (messageBrokerClient) => {
    initBroker(messageBrokerClient);
  },
};
