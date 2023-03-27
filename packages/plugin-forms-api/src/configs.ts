import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { initBroker } from './messageBroker';
import { generateModels } from './connectionResolver';
import * as permissions from './permissions';
import { getSubdomain } from '@erxes/api-utils/src/core';
import forms from './forms';
import initialSetup from './initialSetup';
import segments from './segments';
import dashboards from './dashboards';

export let mainDb;
export let debug;
export let serviceDiscovery;

export default {
  name: 'forms',
  permissions,
  hasDashboard: true,
  meta: {
    dashboards,
    forms,
    initialSetup,
    // for fixing permissions
    permissions,
    segments
  },
  graphql: async sd => {
    serviceDiscovery = sd;

    return {
      typeDefs: await typeDefs(sd),
      resolvers: await resolvers(sd)
    };
  },
  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);
    context.models = await generateModels(subdomain);
    context.subdomain = subdomain;

    return context;
  },
  onServerInit: async options => {
    mainDb = options.db;

    initBroker(options.messageBrokerClient);

    debug = options.debug;
  }
};
