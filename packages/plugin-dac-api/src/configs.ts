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
import app from '@erxes/api-utils/src/app';
export let mainDb;
export let debug;

export default {
  name: 'dac',
  permissions,
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
    };
  },
  hasSubscriptions: false,

  meta: {
    afterMutations,
    permissions,
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
  onServerInit: async (options) => {
    mainDb = options.db;

    initBroker(options.messageBrokerClient);

    debug = options.debug;

    app.use(dacRouter);
  },
};
