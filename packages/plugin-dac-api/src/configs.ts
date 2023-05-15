import { initBroker } from './messageBroker';
import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import afterMutations from './afterMutations';
import {
  createCustomer,
  getCustomer,
  getCustomerByCardCode,
  updateCustomer
} from './api/erxesApi';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';
import * as permissions from './permissions';
import cronjobs from './cronjobs/cupon';

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
    permissions,
    cronjobs
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

  onServerInit: async options => {
    mainDb = options.db;

    initBroker(options.messageBrokerClient);

    graphqlPubsub = options.pubsubClient;

    debug = options.debug;
  }
};
