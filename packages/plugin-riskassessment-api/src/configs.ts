import resolvers from './graphql/resolvers';
import typeDefs from './graphql/typeDefs';

import { getSubdomain } from '@erxes/api-utils/src/core';
import afterMutations from './afterMutations';
import { generateModels } from './connectionResolver';
import cronjobs from './cronjobs';
import { generateAllDataLoaders } from './dataLoaders';
import { initBroker } from './messageBroker';
import * as permissions from './permissions';
import tags from './tags';
import forms from './forms';

export let mainDb;
export let debug;
export let graphqlPubsub;
export let serviceDiscovery;

export default {
  name: 'riskassessment',
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
    const models = await generateModels(subdomain);

    context.subdomain = req.hostname;
    context.models = models;

    context.dataLoaders = generateAllDataLoaders(models, subdomain);

    return context;
  },
  onServerInit: async options => {
    mainDb = options.db;

    initBroker(options.messageBrokerClient);

    graphqlPubsub = options.pubsubClient;

    debug = options.debug;
  },
  meta: {
    afterMutations,
    tags,
    cronjobs,
    forms
  }
};
