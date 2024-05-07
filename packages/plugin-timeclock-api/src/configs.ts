import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { setupMessageConsumers } from './messageBroker';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';
import cronjobs from './cronjobs/timelock';
import { routeErrorHandling } from '@erxes/api-utils/src/requests';
import { buildFile } from './reportExport';
import * as permissions from './permissions';
import { removeDuplicates } from './removeDuplicateTimeclocks';
import app from '@erxes/api-utils/src/app';
import { buildFile as timeclockBuildFile } from './timeclockExport';

export default {
  name: 'timeclock',
  permissions,
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
    };
  },

  meta: {
    cronjobs,
    permissions,
  },

  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    context.subdomain = subdomain;
    context.models = models;

    return context;
  },

  onServerInit: async () => {
    app.get(
      '/remove-duplicates',
      routeErrorHandling(async (req: any, res) => {
        const remove = await removeDuplicates();
        return res.send(remove);
      }),
    );

    app.get(
      '/report-export',
      routeErrorHandling(async (req: any, res) => {
        const { query } = req;
        const subdomain = getSubdomain(req);
        const models = await generateModels(subdomain);

        const result = await buildFile(models, subdomain, query);

        res.attachment(`${result.name}.xlsx`);

        return res.send(result.response);
      }),
    );

    app.get(
      '/timeclock-export',
      routeErrorHandling(async (req: any, res) => {
        const { query } = req;

        const subdomain = getSubdomain(req);
        const models = await generateModels(subdomain);

        const result = await timeclockBuildFile(models, subdomain, query);

        res.attachment(`${result.name}.xlsx`);

        return res.send(result.response);
      }),
    );

    app.get(
      '/timeclock-export',
      routeErrorHandling(async (req: any, res) => {
        const { query } = req;

        const subdomain = getSubdomain(req);
        const models = await generateModels(subdomain);

        const result = await timeclockBuildFile(models, subdomain, query);

        res.attachment(`${result.name}.xlsx`);

        return res.send(result.response);
      }),
    );
  },
  setupMessageConsumers,
};
