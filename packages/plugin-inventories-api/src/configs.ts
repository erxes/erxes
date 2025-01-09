import { generateModels } from './connectionResolver';
import resolvers from './graphql/resolvers';
import typeDefs from './graphql/typeDefs';

import { setupMessageConsumers } from './messageBroker';
// import logs from './logUtils';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { exportCensusRunner } from './exporterByUrl';
import * as permissions from './permissions';
import imports from './imports';
import forms from './forms';

export default {
  name: 'inventories',
  permissions,
  getHandlers: [{ path: `/file-export-census`, method: exportCensusRunner }],
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

  onServerInit: async () => {},
  setupMessageConsumers,

  meta: {
    permissions,
    imports,
    forms,
  },
};
