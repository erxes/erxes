import resolvers from './graphql/resolvers';
import typeDefs from './graphql/typeDefs';

import { getSubdomain } from '@erxes/api-utils/src/core';
import afterMutations from './afterMutations';
import { generateModels } from './connectionResolver';
import cronjobs from './cronjobs';
import { generateAllDataLoaders } from './dataLoaders';
import { setupMessageConsumers } from './messageBroker';
import * as permissions from './permissions';
import tags from './tags';
import forms from './forms';

export default {
  name: 'riskassessment',
  permissions,
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
    };
  },
  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    context.subdomain = subdomain;
    context.models = models;

    context.dataLoaders = generateAllDataLoaders(models, subdomain);

    return context;
  },
  onServerInit: async () => {},
  setupMessageConsumers,
  meta: {
    afterMutations,
    tags,
    cronjobs,
    forms,
    permissions,
  },
};
