import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { generateModels } from './connectionResolver';
import { setupMessageConsumers } from './messageBroker';
import documents from './documents';
import forms from './forms';
import imports from './imports';
import exporter from './exporter';
import logs from './logUtils';
import * as permissions from './permissions';
import payment from './payment';
import { storeInterestCron } from './cronjobs/contractCronJobs';

export default {
  name: 'savings',
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
  meta: {
    logs: { consumers: logs },
    cronjobs: {
      handleMinutelyJob: storeInterestCron,
    },
    documents,
    permissions,
    forms,
    imports,
    exporter,
    payment,
  },
};
