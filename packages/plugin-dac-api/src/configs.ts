import { getSubdomain } from '@erxes/api-utils/src/core';
import * as cookieParser from 'cookie-parser';
import afterMutations from './aftermutations';
import { generateModels } from './connectionResolver';
import dacRouter from './dacRouter';
import resolvers from './graphql/resolvers';
import typeDefs from './graphql/typeDefs';
import { initBroker } from './messageBroker';
import cpUserMiddleware from './middlewares/cpUserMiddleware';
import * as permissions from './permissions';
import * as bodyParser from 'body-parser';

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

  // getHandlers: [
  //   {
  //     path: `/customer`,
  //     method: getCustomer
  //   },
  //   {
  //     path: `/customerId`,
  //     method: getCustomerByCardCode
  //   }
  // ],
  // postHandlers: [
  //   { path: `/customer`, method: createCustomer },
  //   { path: `/customerUpdate`, method: updateCustomer }
  // ],

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
  middlewares: [cookieParser(), cpUserMiddleware, bodyParser.json()],
  onServerInit: async options => {
    const { app } = options;
    mainDb = options.db;

    initBroker(options.messageBrokerClient);

    graphqlPubsub = options.pubsubClient;

    debug = options.debug;

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.use(dacRouter);
  }
};
