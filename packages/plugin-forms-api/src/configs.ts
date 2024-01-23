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

export default {
  name: 'forms',
  permissions,
  meta: {
    dashboards,
    forms,
    initialSetup,
    // for fixing permissions
    permissions,
    segments,
  },
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
    };
  },
  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);
    context.models = await generateModels(subdomain);
    context.subdomain = subdomain;

    return context;
  },
  onServerInit: async (options) => {
    mainDb = options.db;

    initBroker();

    debug = options.debug;
  },
};
