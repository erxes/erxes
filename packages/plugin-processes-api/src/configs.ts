import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import * as permissions from './permissions';
import { generateModels } from './connectionResolver';

import { initBroker } from './messageBroker';
import logs from './logUtils';
import beforeResolvers from './beforeResolvers';
import { getSubdomain } from '@erxes/api-utils/src/core';

export let debug;
export let graphqlPubsub;
export let mainDb;
export let serviceDiscovery;

export default {
  name: 'processes',
  permissions,
  graphql: async sd => {
    serviceDiscovery = sd;
    return {
      typeDefs: await typeDefs(sd),
      resolvers: await resolvers(sd)
    };
  },
  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    context.subdomain = subdomain;
    context.models = await generateModels(subdomain);

    return context;
  },
  onServerInit: async options => {
    mainDb = options.db;

    await generateModels('os');

    initBroker(options.messageBrokerClient);

    debug = options.debug;
    graphqlPubsub = options.pubsubClient;
    // es = options.elasticsearch;
  },
  meta: { logs: { consumers: logs }, beforeResolvers }
};
