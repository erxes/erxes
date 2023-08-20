import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { initBroker } from './messageBroker';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';
import { routeErrorHandling } from '@erxes/api-utils/src/requests';
import { buildFile } from './reportExport';
import * as permissions from './permissions';

export let mainDb;
export let debug;
export let graphqlPubsub;
export let serviceDiscovery;
export let redis;

export default {
  name: 'timeclock',
  permissions,
  graphql: async sd => {
    serviceDiscovery = sd;

    return {
      typeDefs: await typeDefs(sd),
      resolvers: await resolvers(sd)
    };
  },

  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    context.subdomain = req.hostname;
    context.models = models;

    return context;
  },

  onServerInit: async options => {
    mainDb = options.db;
    const app = options.app;
    app.get(
      '/report-export',
      routeErrorHandling(async (req: any, res) => {
        const { query } = req;
        const subdomain = getSubdomain(req);
        const models = await generateModels(subdomain);

        const result = await buildFile(models, subdomain, query);

        res.attachment(`${result.name}.xlsx`);

        return res.send(result.response);
      })
    );

    initBroker(options.messageBrokerClient);

    graphqlPubsub = options.pubsubClient;
    redis = options.redis;
    debug = options.debug;
  }
};
