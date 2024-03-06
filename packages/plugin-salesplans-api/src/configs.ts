import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import * as permissions from './permissions';
import { generateModels } from './connectionResolver';

import { setupMessageConsumers } from './messageBroker';
import { getSubdomain } from '@erxes/api-utils/src/core';

export let debug: any;
export let graphqlPubsub: any;
export let mainDb: any;

export default {
  name: 'salesplans',
  permissions,
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers,
    };
  },
  apolloServerContext: async (context: any, req: any) => {
    const subdomain = getSubdomain(req);

    context.subdomain = subdomain;
    context.models = await generateModels(subdomain);

    return context;
  },
  onServerInit: async (options: any) => {},
  setupMessageConsumers,
  meta: {
    permissions,
  },
};
