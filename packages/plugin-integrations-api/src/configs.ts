import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { initBroker } from './messageBroker';
import initApp from './initApp';
import { generateModels } from './connectionResolver';
import { getSubdomain } from '@erxes/api-utils/src/core';
import dashboards from './dashboards';

export let debug;
export let mainDb;

export default {
  name: 'integrations',
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers,
    };
  },
  hasSubscriptions: false,
  meta: {
    dashboards,
  },
  segment: {},
  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    const models = await generateModels(subdomain);

    context.subdomain = subdomain;
    context.models = models;

    return context;
  },
  onServerInit: async (options) => {
    mainDb = options.db;

    initBroker(options.messageBrokerClient);

    initApp();

    debug = options.debug;
  },
};
