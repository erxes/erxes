import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
// import { IFetchElkArgs } from '@erxes/api-utils/src/types';
import * as permissions from './permissions';
import { generateModels, models } from './connectionResolver';

import { initBroker } from './messageBroker';
import { initMemoryStorage } from './inmemoryStorage';
import logs from './logUtils';

export let debug;
export let graphqlPubsub;
export let mainDb;
export let serviceDiscovery;

// export let es: {
//   client;
//   fetchElk(args: IFetchElkArgs): Promise<any>;
//   getMappings(index: string): Promise<any>;
//   getIndexPrefix(): string;
// };

export default {
  name: 'tags',
  permissions,
  graphql: async sd => {
    serviceDiscovery = sd;
    return {
      typeDefs: await typeDefs(sd),
      resolvers: await resolvers(sd)
    };
  },
  apolloServerContext: context => {
    const subdomain = 'os';

    context.subdomain = subdomain;
    context.models = models;

    return context;
  },
  onServerInit: async options => {
    mainDb = options.db;

    await generateModels('os');

    initBroker(options.messageBrokerClient);

    initMemoryStorage();

    debug = options.debug;
    graphqlPubsub = options.pubsubClient;
    // es = options.elasticsearch;
  },
  meta: { logs: { consumers: logs } }
};
