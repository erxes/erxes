import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { generateModels } from './connectionResolver';
import { initBroker } from './messageBroker';
import { getSubdomain } from '@erxes/api-utils/src/core';
import * as permissions from './permissions';
import forms from './forms';
import segments from './segments';
import tags from './tags';

export default {
  name: 'cars',
  permissions,
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
    };
  },

  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    context.subdomain = subdomain;
    context.models = await generateModels(subdomain);

    return context;
  },

  onServerInit: async () => {
    initBroker();
  },
  meta: { forms, tags, segments },
};
