import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { setupMessageConsumers } from './messageBroker';
import { generateModels } from './connectionResolver';
import * as permissions from './permissions';
import cronjobs from './cronjobs/automations';
import tags from './tags';
import logs from './logUtils';
import { getSubdomainHeader } from '@erxes/api-utils/src/headers';

export default {
  name: 'automations',
  permissions,
  // for fixing permissions
  meta: {
    permissions,
    cronjobs,
    tags,
    logs: { providesActivityLog: true, consumers: logs },
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
