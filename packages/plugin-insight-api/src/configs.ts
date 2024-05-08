import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { generateModels } from './connectionResolver';

import { setupMessageConsumers } from './messageBroker';
import { getSubdomain } from '@erxes/api-utils/src/core';
import app from '@erxes/api-utils/src/app';
import { routeErrorHandling } from '@erxes/api-utils/src/requests';
import { buildFile } from './export';

export default {
  name: 'insight',
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
    };
  },
  apolloServerContext: async (context, req, res) => {
    const subdomain = getSubdomain(req);

    context.subdomain = subdomain;
    context.models = await generateModels(subdomain);

    // context.serverTiming = {
    //   startTime: res.startTime,
    //   endTime: res.endTime,
    //   setMetric: res.setMetric,
    // };

    return context;
  },

  onServerInit: async () => {
    app.get(
      '/chart-table-export',
      routeErrorHandling(async (req: any, res) => {
        const { query } = req;

        const subdomain = getSubdomain(req);
        const models = await generateModels(subdomain);

        const result = await buildFile(subdomain, query);

        res.attachment(`${result.name}.xlsx`);

        return res.send(result.response);
      }),
    );
  },
  setupMessageConsumers,

  meta: {},
};
