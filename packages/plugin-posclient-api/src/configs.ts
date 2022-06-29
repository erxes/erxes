import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { generateModels } from './connectionResolver';
import { initBroker } from './messageBroker';
import { initMemoryStorage } from './inmemoryStorage';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { posInitialSetup } from './routes';
import * as cookieParser from 'cookie-parser';
import posUserMiddleware from './userMiddleware';
import * as dotenv from 'dotenv';

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
  getHandlers: [{ path: `/initial-setup`, method: posInitialSetup }],

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
    context.config = await models.Configs.findOne({}).lean();
    context.requestInfo = requestInfo;
    context.res = res;

    if (req.posUser) {
      context.posUser = req.posUser;
    }

    return context;
  },
  middlewares: [cookieParser(), posUserMiddleware],

  onServerInit: async options => {
    mainDb = options.db;

    initBroker(options.messageBrokerClient);

    initMemoryStorage();

    graphqlPubsub = options.pubsubClient;

    debug = options.debug;
  }
};
