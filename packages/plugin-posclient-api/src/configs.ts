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
  getHandlers: [{ path: `/initial-setup`, method: posInitialSetup }],

  apolloServerContext: async (context, req, res) => {
    const subdomain = getSubdomain(req);

    const requestInfo = {
      secure: req.secure,
      cookies: req.cookies,
      headers: req.headers
    };

    const models = await generateModels(subdomain);

    const { POS_ID } = process.env;
    console.log(POS_ID);
    const sda = await models.Configs.find({
      token: 'MPXA0yQBfdAZThyvAG9BvsafCCPNAbmN'
    });
    console.log('213213', sda);

    context.subdomain = subdomain;
    context.models = models;
    context.config = await models.Configs.findOne({
      token: 'MPXA0yQBfdAZThyvAG9BvsafCCPNAbmN'
    });
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
