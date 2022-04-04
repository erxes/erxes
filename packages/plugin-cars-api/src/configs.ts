import typeDefs from "./graphql/typeDefs";
import resolvers from "./graphql/resolvers";
import { IFetchElkArgs } from "@erxes/api-utils/src/types";
import { generateModels } from "./connectionResolver";
import { initBroker } from "./messageBroker";
import { initMemoryStorage } from "./inmemoryStorage";

export let debug;
export let graphqlPubsub;
export let mainDb;
export let serviceDiscovery;

export let es: {
  client;
  fetchElk(args: IFetchElkArgs): Promise<any>;
  getMappings(index: string): Promise<any>;
  getIndexPrefix(): string;
};

export default {
  name: "cars",
  graphql: async (sd) => {
    serviceDiscovery = sd;
    return {
      typeDefs: await typeDefs(sd),
      resolvers: await resolvers(sd),
    };
  },

  apolloServerContext: async (context) => {
    const subdomain = "os";

    context.subdomain = subdomain;
    context.models = await generateModels("os");

    return context;
  },

  onServerInit: async (options) => {
    mainDb = options.db;

    initBroker(options.messageBrokerClient);

    initMemoryStorage();

    debug = options.debug;
    graphqlPubsub = options.pubsubClient;
    es = options.elasticsearch;
  },
  meta: {},
};
