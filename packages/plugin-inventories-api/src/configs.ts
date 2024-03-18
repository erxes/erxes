import { generateModels } from './connectionResolver';
import resolvers from './graphql/resolvers';
import typeDefs from './graphql/typeDefs';

import { setupMessageConsumers } from './messageBroker';
// import logs from './logUtils';
import { exportCensusRunner } from './exporterByUrl';
import * as permissions from './permissions';

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
    const { subdomain } = context;

    context.models = await generateModels(subdomain);

    return context;
  },

  onServerInit: async () => {},
  setupMessageConsumers,

  meta: {
    permissions,
  },
};
