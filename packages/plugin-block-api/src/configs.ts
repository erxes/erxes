import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { initBroker } from './messageBroker';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { generateModels, models } from './connectionResolver';
import { routeErrorHandling } from '@erxes/api-utils/src/requests';
import { debugInfo } from '@erxes/api-utils/src/debuggers';

export let mainDb;
export let debug;
export let graphqlPubsub;
export let serviceDiscovery;

export default {
  name: 'block',
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

    app.post(
      '/tdb-receive',
      routeErrorHandling(async (req, res) => {
        debugInfo(`tdb-recieve: `);
        console.log('tdb-recieve');
        console.log(JSON.stringify(req.body));

        const body = JSON.stringify(req.body);

        const subdomain = getSubdomain(req);

        const models = await generateModels(subdomain);

        await models.Transactions.create({ body });

        return res.json({ response: 'success' });
      })
    );

    initBroker(options.messageBrokerClient);

    graphqlPubsub = options.pubsubClient;

    debug = options.debug;
  }
};
