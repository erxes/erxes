import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { initBroker, sendSegmentsMessage } from './messageBroker';
import { routeErrorHandling } from '@erxes/api-utils/src/requests';
import { buildFile } from './exporter';
import segments from './segments';
import dashboards from './dashboards';
import forms from './forms';
import { generateModels } from './connectionResolver';
import logs from './logUtils';
import imports from './imports';
import tags from './tags';
import internalNotes from './internalNotes';
import automations from './automations';
import search from './search';
import * as permissions from './permissions';
import { getSubdomain } from '@erxes/api-utils/src/core';
import webhooks from './webhooks';

export let mainDb;
export let graphqlPubsub;
export let serviceDiscovery;

export let debug;

export default {
  name: 'contacts',
  permissions,
  graphql: async sd => {
    serviceDiscovery = sd;

    return {
      typeDefs: await typeDefs(sd),
      resolvers
    };
  },

  hasSubscriptions: true,
  meta: {
    imports,
    segments,
    automations,
    forms,
    logs: { consumers: logs },
    tags,
    search,
    internalNotes,
    webhooks,
    dashboards
  },
  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    context.models = await generateModels(subdomain);
    context.subdomain = subdomain;
  },

  onServerInit: async options => {
    const app = options.app;
    mainDb = options.db;

    app.get(
      '/file-export',
      routeErrorHandling(async (req: any, res) => {
        const { query } = req;
        const { segment } = query;
        const subdomain = getSubdomain(req);
        const models = await generateModels(subdomain);

        const result = await buildFile(models, subdomain, query);

        res.attachment(`${result.name}.xlsx`);

        if (segment) {
          try {
            sendSegmentsMessage({
              subdomain,
              action: 'removeSegment',
              data: { segmentId: segment }
            });
          } catch (e) {
            console.log((e as Error).message);
          }
        }

        return res.send(result.response);
      })
    );

    initBroker(options.messageBrokerClient);

    debug = options.debug;
    graphqlPubsub = options.pubsubClient;
  }
};
