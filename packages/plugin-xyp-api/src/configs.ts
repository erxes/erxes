import { getSubdomain } from '@erxes/api-utils/src/core';

import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { initBroker } from './messageBroker';
import { generateModels } from './connectionResolver';

export let mainDb;
export let debug;
export let graphqlPubsub;
export let serviceDiscovery;

export default {
  name: 'xyp',
  graphql: async sd => {
    serviceDiscovery = sd;

    return {
      typeDefs: await typeDefs(sd),
      resolvers: await resolvers(sd)
    };
  },

  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    context.subdomain = subdomain;
    context.models = await generateModels(subdomain);

    if (req.cpUser) {
      context.cpUser = req.cpUser;
    }
    return context;
  },

  onServerInit: async options => {
    mainDb = options.db;

    initBroker(options.messageBrokerClient);

    graphqlPubsub = options.pubsubClient;

    debug = options.debug;
  }
};

// import typeDefs from './graphql/typeDefs';
// import resolvers from './graphql/resolvers';

// import { initBroker } from './messageBroker';

// export let mainDb;
// export let debug;
// export let graphqlPubsub;
// export let serviceDiscovery;

// export default {
//   name: 'kkk',
//   graphql: async sd => {
//     serviceDiscovery = sd;

//     return {
//       typeDefs: await typeDefs(sd),
//       resolvers: await resolvers(sd)
//     };
//   },

//   apolloServerContext: async (context) => {
//     return context;
//   },

//   onServerInit: async options => {
//     mainDb = options.db;

//     initBroker(options.messageBrokerClient);

//     graphqlPubsub = options.pubsubClient;

//     debug = options.debug;
//   }
// };
