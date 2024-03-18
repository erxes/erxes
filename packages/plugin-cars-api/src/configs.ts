import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { generateModels } from './connectionResolver';
import { setupMessageConsumers } from './messageBroker';
import * as permissions from './permissions';
import forms from './forms';
import segments from './segments';
import tags from './tags';
import { getSubdomainHeader } from '@erxes/api-utils/src/headers';

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
    const { subdomain } = context;
    context.models = await generateModels(subdomain);
    return context;
  },

  onServerInit: async () => {},
  setupMessageConsumers,
  meta: { forms, tags, segments, permissions },
};
