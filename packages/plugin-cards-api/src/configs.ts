import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import apiConnect from './apiCollections';

import { initBroker } from './messageBroker';
import { IFetchElkArgs } from '@erxes/api-utils/src/types';
import { initMemoryStorage } from './inmemoryStorage';
import { IMPORT_TYPES } from './constants';

export let graphqlPubsub;

export let es: {
  client;
  fetchElk(args: IFetchElkArgs): Promise<any>;
  getMappings(index: string): Promise<any>;
  getIndexPrefix(): string;
};

export let debug;

export default {
  name: 'cards',
  graphql: async (serviceDiscovery) => {
    return {
      typeDefs: await typeDefs(serviceDiscovery),
      resolvers
    }
  },
  segment: {
    indexesTypeContentType: {
      deal: 'deals',
      ticket: 'tickets',
      task: 'tasks'
    },
    contentTypes: ['deal', 'ticket', 'task'],
    esTypesMapQueue: 'cards:segments:esTypesMap',
    initialSelectorQueue: 'cards:segments:initialSelector',
    associationTypesQueue: 'cards:segments:associationTypes',
    propertyConditionExtenderQueue: 'cards:segments:propertyConditionExtender'
  },
  hasSubscriptions: true,
  importTypes: IMPORT_TYPES,
  apolloServerContext: context => {
    return context;
  },
  onServerInit: async options => {
    await apiConnect();

    initBroker(options.messageBrokerClient);

    initMemoryStorage();

    debug = options.debug;
    graphqlPubsub = options.pubsubClient;
    es = options.elasticsearch;
  }
};
