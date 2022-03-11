import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { initBroker, sendSegmentsMessage } from './messageBroker';
import { IFetchElkArgs } from '@erxes/api-utils/src/types';
import { initMemoryStorage } from './inmemoryStorage';
import { EXPORT_TYPES, IMPORT_TYPES } from './constants';
import permissions from './permissions';
import { routeErrorHandling } from '@erxes/api-utils/src/requests';
import { buildFile } from './exporter';
import segments from './segments';
import forms from './forms';
import logsConsumers from './logsConsumers';
import { generateCoreModels, generateModels, getSubdomain } from './connectionResolver';

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
  importTypes: IMPORT_TYPES,
  exportTypes: EXPORT_TYPES,
  meta: {
    forms,
    logs: { providesActivityLog: true, consumers: logsConsumers },
    segments
  },
  apolloServerContext: context => {
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

        const result = await buildFile(models, coreModels, query, user);

        res.attachment(`${result.name}.xlsx`);

        if (segment) {
          try {
            sendSegmentsMessage('removeSegment', { segmentId: segment });
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