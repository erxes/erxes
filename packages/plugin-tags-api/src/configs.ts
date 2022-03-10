import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { initBroker } from './messageBroker';
import { initMemoryStorage } from './inmemoryStorage';
import { IFetchElkArgs } from '@erxes/api-utils/src/types';
import { coreModels, generateModels, models } from './connectionResolver';

export let debug;
export let mainDb;

export let es: {
  client;
  fetchElk(args: IFetchElkArgs): Promise<any>;
  getMappings(index: string): Promise<any>;
  getIndexPrefix(): string;
};

export default {
  name: 'tags',
  graphql: async (sd) => {
    return {
      typeDefs: await typeDefs(sd),
      resolvers: await resolvers(sd),
    };
  },
  apolloServerContext: (context) => {
    context.models = models;
    context.coreModels = coreModels;
  },
  onServerInit: async (options) => {
    mainDb = options.db;
    await generateModels('os');

    initBroker(options.messageBrokerClient);

    initMemoryStorage();

    debug = options.debug;
    es = options.elasticsearch;
  },
};
