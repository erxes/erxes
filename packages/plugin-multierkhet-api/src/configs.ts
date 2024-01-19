import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { generateModels } from './connectionResolver';

import { initBroker } from './messageBroker';
import { initBrokerErkhet } from './messageBrokerErkhet';
import afterMutations from './afterMutations';
import { getSubdomain } from '@erxes/api-utils/src/core';
import * as permissions from './permissions';
import afterQueries from './afterQueries';
import { getOrderInfo } from './routes';

export let debug;

export let mainDb;


export default {
  name: 'multierkhet',
  permissions,
  hasSubscriptions: true,
  subscriptionPluginPath: require('path').resolve(
    __dirname,
    'graphql',
    'subscriptionPlugin.js',
  ),
  getHandlers: [{ path: `/getOrderInfo`, method: getOrderInfo }],
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
    };
  },
  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    context.subdomain = subdomain;
    context.models = await generateModels(subdomain);

    return context;
  },

  onServerInit: async (options) => {
    mainDb = options.db;

    await initBrokerErkhet();
    await initBroker(options.messageBrokerClient);

    debug = options.debug;
  },
  meta: {
    afterMutations,
    afterQueries,
    permissions,
  },
};
