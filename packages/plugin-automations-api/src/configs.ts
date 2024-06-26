import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { setupMessageConsumers } from './messageBroker';
import { generateModels } from './connectionResolver';
import * as permissions from './permissions';
import { getSubdomain } from '@erxes/api-utils/src/core';
import cronjobs from './cronjobs/automations';
import tags from './tags';
import templates from './templates';
import logs from './logUtils';

export default {
  name: 'automations',
  permissions,
  // for fixing permissions
  meta: {
    permissions,
    cronjobs,
    tags,
    templates,
    logs: { providesActivityLog: true, consumers: logs },
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
