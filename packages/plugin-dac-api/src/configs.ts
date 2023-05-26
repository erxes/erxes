import { initBroker } from './messageBroker';
import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import afterMutations from './aftermutations';
import {
  createCustomer,
  getCustomer,
  getCustomerByCardCode,
  updateCustomer
} from './api/erxesApi';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';
import * as permissions from './permissions';
import cpUserMiddleware from './middlewares/cpUserMiddleware';
import * as cookieParser from 'cookie-parser';

export let mainDb;
export let debug;
export let graphqlPubsub;
export let serviceDiscovery;

export default {
  name: 'dac',
  permissions,
  graphql: async sd => {
    serviceDiscovery = sd;
    return {
      typeDefs: await typeDefs(sd),
      resolvers: await resolvers(sd)
    };
  },
  hasSubscriptions: false,

  meta: {
    afterMutations,
    permissions
  },

  getHandlers: [
    {
      path: `/customer`,
      method: getCustomer
    },
    {
      path: `/customerId`,
      method: getCustomerByCardCode
    }
  ],
  postHandlers: [
    { path: `/customer`, method: createCustomer },
    { path: `/customerUpdate`, method: updateCustomer }
  ],

  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    context.subdomain = req.hostname;
    context.models = models;
    if (req.cpUser) {
      context.cpUser = req.cpUser;
    }

    return context;
  },
  middlewares: [cookieParser(), cpUserMiddleware],
  onServerInit: async options => {
    mainDb = options.db;

    initBroker(options.messageBrokerClient);

    graphqlPubsub = options.pubsubClient;

    debug = options.debug;
  }
};
