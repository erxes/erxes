import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { setupMessageConsumers } from './messageBroker';
import { generateModels } from './connectionResolver';
import * as permissions from './permissions';
import { getSubdomain } from '@erxes/api-utils/src/core';
import forms from './forms';
import initialSetup from './initialSetup';
import segments from './segments';
import dashboards from './dashboards';
import templates from './templates';
import automations from './automations';

export default {
  name: 'forms',
  permissions,
  meta: {
    dashboards,
    templates,
    forms,
    initialSetup,
    // for fixing permissions
    permissions,
    segments,
    automations,
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
  onServerInit: async () => {},
  setupMessageConsumers,
};
