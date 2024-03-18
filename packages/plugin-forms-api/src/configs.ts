import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { setupMessageConsumers } from './messageBroker';
import { generateModels } from './connectionResolver';
import * as permissions from './permissions';
import forms from './forms';
import initialSetup from './initialSetup';
import segments from './segments';
import dashboards from './dashboards';

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
    const { subdomain } = context;
    context.models = await generateModels(subdomain);

    return context;
  },
  onServerInit: async () => {},
  setupMessageConsumers,
};
