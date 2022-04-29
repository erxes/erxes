import { IFetchElkArgs } from '@erxes/api-utils/src/types';

import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers/index';
import telnyx from './api/telnyx';
import { engageTracker } from './trackers/engageTracker';
import { initBroker } from './messageBroker';
import { generateModels } from './connectionResolver';
import tags from './tags';
import logs from './logUtils';
import permissions from './permissions';
import { getSubdomain } from '@erxes/api-utils/src/core';

export let graphqlPubsub;
export let serviceDiscovery;
export let mainDb;
export let debug;

export let es: {
  client;
  fetchElk(args: IFetchElkArgs): Promise<any>;
  getMappings(index: string): Promise<any>;
  getIndexPrefix(): string;
};

export default {
  name: 'engages',
  permissions,
  graphql: async (sd) => {
    serviceDiscovery = sd;

    return {
      typeDefs: await typeDefs(sd),
      resolvers,
    }
  },
  segment: { schemas: [] },
  hasSubscriptions: false,
  meta: { tags, logs: { consumers: logs } },
  postHandlers: [{ path: `/service/engage/tracker`, method: engageTracker }],
  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    context.dataloaders = {};
    context.docModifier = (doc) => doc;

    context.models = await generateModels(subdomain);
    context.subdomain = subdomain;

    return context;
  },
  onServerInit: async (options) => {
    mainDb = options.db;

    const app = options.app;

    // Insert routes below
    app.use('/telnyx', telnyx);

    initBroker(options.messageBrokerClient);

    debug = options.debug;
    graphqlPubsub = options.pubsubClient;
    es = options.elasticsearch;
  },
};
