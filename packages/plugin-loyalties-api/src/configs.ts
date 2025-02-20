import app from '@erxes/api-utils/src/app';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { routeErrorHandling } from '@erxes/api-utils/src/requests';
import automations from './automations';
import { generateModels } from './connectionResolver';
import cronjobs from './cronjobs';
import { buildFile } from './export';
import resolvers from './graphql/resolvers';
import typeDefs from './graphql/typeDefs';
import logs from './logUtils';
import { setupMessageConsumers } from './messageBroker';
import * as permissions from './permissions';
import changeStream from './changeStream';

export default {
  name: 'loyalties',
  permissions,
  meta: {
    logs: { consumers: logs },
    cronjobs,
    automations,
    // for fixing permissions
    permissions,
  },
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
  onServerInit: async () => {
    app.get(
      '/file-export',
      routeErrorHandling(async (req: any, res) => {
        const { query } = req;

        const subdomain = getSubdomain(req);
        const models = await generateModels(subdomain);

        const result = await buildFile(models, subdomain, {
          campaignId: query.campaignId,
        });

        res.attachment(`${result.name}.xlsx`);

        return res.send(result.response);
      }),
    );
  },
  setupMessageConsumers,
};
