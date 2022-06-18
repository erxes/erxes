import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers/index';
import telnyx from './api/telnyx';
import { engageTracker } from './trackers/engageTracker';
import { initBroker } from './messageBroker';
import { generateModels } from './connectionResolver';
import tags from './tags';
import logs from './logUtils';
import cronjobs from './cronjobs/engages';
import * as permissions from './permissions';
import { getSubdomain } from '@erxes/api-utils/src/core';
import webhooks from './webhooks';
import segments from './segments';

export let graphqlPubsub;
export let serviceDiscovery;
export let mainDb;
export let debug;

export default {
  name: 'engages',
  permissions,
  graphql: async sd => {
    serviceDiscovery = sd;

    return {
      typeDefs: await typeDefs(sd),
      resolvers
    };
  },
  segment: { schemas: [] },
  hasSubscriptions: false,
  meta: { tags, logs: { consumers: logs }, webhooks, cronjobs, segments },
  postHandlers: [{ path: `/service/engage/tracker`, method: engageTracker }],
  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    context.dataloaders = {};
    context.docModifier = doc => doc;

    context.models = await generateModels(subdomain);
    context.subdomain = subdomain;

    return context;
  },
  onServerInit: async options => {
    mainDb = options.db;

    const app = options.app;

    // Insert routes below
    app.use('/telnyx', telnyx);

    initBroker(options.messageBrokerClient);

    debug = options.debug;
    graphqlPubsub = options.pubsubClient;
  }
};
