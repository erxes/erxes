import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { initBroker, sendSegmentsMessage } from './messageBroker';
import { IFetchElkArgs } from '@erxes/api-utils/src/types';
import { initMemoryStorage } from './inmemoryStorage';
import permissions from './permissions';
import { routeErrorHandling } from '@erxes/api-utils/src/requests';
import { buildFile } from './exporter';
import segments from './segments';
import forms from './forms';
import logs from './logUtils';
import { generateCoreModels, generateModels, getSubdomain } from './connectionResolver';
import imports from './imports';
import internalNotes from './internalNotes';

export let mainDb;
export let graphqlPubsub;
export let serviceDiscovery;

export let es: {
  client;
  fetchElk(args: IFetchElkArgs): Promise<any>;
  getMappings(index: string): Promise<any>;
  getIndexPrefix(): string;
};

export let debug;

export default {
  name: 'cards',
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
    forms,
    logs: { providesActivityLog: true, consumers: logs },
    segments,
    imports,
    internalNotes
  },

  apolloServerContext: async (context) => {
    const subdomain = 'os';

    context.models = await generateModels(subdomain);
    context.coreModels = await generateCoreModels(subdomain);
    context.subdomain = subdomain;

    return context;
  },
  onServerInit: async options => {
    mainDb = options.db;

    const app = options.app;

    app.get(
      '/file-export',
      routeErrorHandling(async (req: any, res) => {
        const { query, user } = req;
        const { segment } = query;

        const subdomain = getSubdomain(req.hostname);
        const models = await generateModels(subdomain);
        const coreModels = await generateCoreModels(subdomain);

        const result = await buildFile(models, coreModels, subdomain, query, user);

        res.attachment(`${result.name}.xlsx`);

        if (segment) {
          try {
            sendSegmentsMessage({ subdomain, action: 'removeSegment', data: { segmentId: segment } });
          } catch (e) {
            console.log((e as Error).message);
          }
        }

        return res.send(result.response);
      })
    );

    initBroker(options.messageBrokerClient);

    initMemoryStorage();

    debug = options.debug;
    graphqlPubsub = options.pubsubClient;
    es = options.elasticsearch;
  }
};