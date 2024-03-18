import * as serverTiming from 'server-timing';
import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { generateModels } from './connectionResolver';

import { setupMessageConsumers } from './messageBroker';
import logs from './logUtils';
import * as permissions from './permissions';
import dashboards from './dashboards';

export default {
  name: 'tags',
  permissions,
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
    };
  },
  apolloServerContext: async (context, req, res) => {
    const { subdomain } = context;

    context.models = await generateModels(subdomain);

    context.serverTiming = {
      startTime: res.startTime,
      endTime: res.endTime,
      setMetric: res.setMetric,
    };

    return context;
  },
  middlewares: [(serverTiming as any)()],

  onServerInit: async () => {},
  setupMessageConsumers,

  meta: { logs: { consumers: logs }, permissions, dashboards },
};
