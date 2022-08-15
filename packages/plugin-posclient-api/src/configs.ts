import typeDefs from './graphql/typeDefs';
import * as cors from 'cors';
import resolvers from './graphql/resolvers';
import { generateModels } from './connectionResolver';
import { initBroker } from './messageBroker';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { callBackQpay, posInitialSetup } from './routes';
import * as cookieParser from 'cookie-parser';
import posUserMiddleware from './userMiddleware';
import posConfigMiddleware from './configMiddleware';
import * as dotenv from 'dotenv';
import { loadSubscriptions } from './subscriptions';

export let debug;
export let graphqlPubsub;
export let mainDb;
export let serviceDiscovery;
dotenv.config();

export default {
  name: 'posclient',
  graphql: async sd => {
    serviceDiscovery = sd;

    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(sd)
    };
  },
  hasSubscriptions: true,
  freeSubscriptions: loadSubscriptions,
  postHandlers: [
    { path: `/pl:posclient/callBackQpay`, method: callBackQpay },
    { path: `/callBackQpay`, method: callBackQpay }
  ],
  getHandlers: [
    { path: `/initial-setup`, method: posInitialSetup },
    { path: `/pl:posclient/initial-setup`, method: posInitialSetup }
  ],

  apolloServerContext: async (context, req, res) => {
    const subdomain = getSubdomain(req);

    const requestInfo = {
      secure: req.secure,
      cookies: req.cookies,
      headers: req.headers
    };

    const models = await generateModels(subdomain);

    context.subdomain = subdomain;
    context.models = models;

    context.requestInfo = requestInfo;
    context.res = res;

    context.config =
      req.posConfig && req.posConfig._id
        ? req.posConfig
        : await models.Configs.findOne({})
            .sort({ createdAt: 1 })
            .lean();

    if (req.posUser) {
      context.posUser = req.posUser;
    }

    return context;
  },
  corsOptions: {
    credentials: true,
    origin: [
      ...(process.env.ALLOWED_ORIGINS || '').split(',').map(c => c && RegExp(c))
    ]
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
          .map(c => c && RegExp(c))
      ]
    })
  ],

  onServerInit: async options => {
    mainDb = options.db;

    initBroker(options.messageBrokerClient);

    graphqlPubsub = options.pubsubClient;

    debug = options.debug;
  }
};
