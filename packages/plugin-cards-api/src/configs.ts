import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import apiConnect from './apiCollections';

import { initBroker, sendSegmentMessage } from './messageBroker';
import { IFetchElkArgs } from '@erxes/api-utils/src/types';
import { initMemoryStorage } from './inmemoryStorage';
import { EXPORT_TYPES, IMPORT_TYPES } from './constants';
import permissions from './permissions';
import { routeErrorHandling } from '@erxes/api-utils/src/requests';
import { buildFile } from './exporter';
import segments from './segments';
import forms from './forms';
import logsConsumers from './logsConsumers';
import imports from './imports';

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
    logs: { providesActivityLog: true, consumers: logsConsumers },
    segments,
    imports
  },

  apolloServerContext: context => {
    return context;
  },
  onServerInit: async options => {
    await apiConnect();

    const app = options.app;

    app.get(
      '/file-export',
      routeErrorHandling(async (req: any, res) => {
        const { query, user } = req;
        const { segment } = query;

        const result = await buildFile(query, user);

        res.attachment(`${result.name}.xlsx`);

        if (segment) {
          try {
            sendSegmentMessage('removeSegment', { segmentId: segment });
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
