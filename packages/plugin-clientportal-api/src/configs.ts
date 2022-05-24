import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import * as permissions from './permissions';
import { initBroker } from './messageBroker';
import { generateCPModels, generateModels } from './connectionResolver';
import { getSubdomain } from '@erxes/api-utils/src/core';
import cpUserMiddleware from './middlewares/cpUserMiddleware';
import * as cookieParser from 'cookie-parser';

export let graphqlPubsub;
export let mainDb;
export let serviceDiscovery;

export let debug;

export default {
  name: 'clientportal',
  permissions,
  graphql: async sd => {
    serviceDiscovery = sd;

    return {
      typeDefs: await typeDefs(sd),
      resolvers
    };
  },
  hasSubscriptions: false,
  segment: {},

  apolloServerContext: async (context, req, res) => {
    const subdomain = getSubdomain(req);

    const clientPortalId = (req.headers['client-portal-id'] || '').toString();

    const requestInfo = {
      secure: req.secure,
      cookies: req.cookies,
      headers: req.headers
    };

    console.log('DDDDDDDDDDDDDDDDDDD ', req.clientPortalId);

    const models = await generateModels(subdomain);

    const clientPortal = await models.ClientPortals.findOne({
      _id: clientPortalId
    }).lean();

    if (clientPortal) {
      context.cpModels = await generateCPModels(clientPortal._id);
    }

    context.subdomain = subdomain;
    context.models = models;
    context.requestInfo = requestInfo;
    context.res = res;

    if (req.cpUser) {
      context.cpUser = req.cpUser;
    }

    return context;
  },
  middlewares: [cookieParser(), cpUserMiddleware],
  onServerInit: async options => {
    const app = options.app;
    mainDb = options.db;

    initBroker(options.messageBrokerClient);

    debug = options.debug;
    graphqlPubsub = options.pubsubClient;
  }
};
