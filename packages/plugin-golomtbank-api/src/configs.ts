import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { setupMessageConsumers } from './messageBroker';
import init from './controller';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';

export default {
  name: 'golomtbank',
  graphql: async() => {
    return {
      typeDefs:await typeDefs(),
      resolvers:await resolvers()
    };
  },
  meta: {
    inboxIntegration: {
      kind: 'golomtbank',
      label: 'Golomtbank'
    }
  },
  apolloServerContext: async (context, req, res) => {
    const subdomain = getSubdomain(req);

    context.subdomain = subdomain;
    context.models = await generateModels(subdomain);

    context.serverTiming = {
      startTime: res.startTime,
      endTime: res.endTime,
      setMetric: res.setMetric,
    };

    return context;
  },

  onServerInit: async () => {
    init();
  },
  setupMessageConsumers,
};
