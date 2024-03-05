import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { setupMessageConsumers } from './messageBroker';
import { generateModels } from './connectionResolver';
import logs from './logUtils';
import { getSubdomain } from '@erxes/api-utils/src/core';

export default {
  name: 'internalnotes',
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
  onServerInit: async () => {
  },
  setupMessageConsumers,
  meta: {
    logs: { providesActivityLog: true, consumers: logs },
  },
};
