import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { setupMessageConsumers } from './messageBroker';
import { generateModels } from './connectionResolver';
import { routeErrorHandling } from '@erxes/api-utils/src/requests';
import app from '@erxes/api-utils/src/app';

import tags from './tags';
import { buildFile } from './reportExport';
import { getSubdomainHeader } from '@erxes/api-utils/src/headers';

export default {
  name: 'reports',
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
    };
  },

  meta: { logs: {}, tags },
  apolloServerContext: async (context, req) => {
    const { subdomain } = context;
    const models = await generateModels(subdomain);

    context.models = models;

    return context;
  },

  onServerInit: async () => {
    app.get(
      '/report-table-export',
      routeErrorHandling(async (req: any, res) => {
        const { query } = req;

        const subdomain = getSubdomainHeader(req);
        const models = await generateModels(subdomain);

        const result = await buildFile(subdomain, query);

        res.attachment(`${result.name}.xlsx`);

        return res.send(result.response);
      }),
    );
  },
  setupMessageConsumers,
};
