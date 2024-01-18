import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { initBroker } from './messageBroker';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';
import initApp from './initApp';
import { INTEGRATION_KINDS } from './constants';
import automations from './automations';
import forms from './forms';
import segments from './segments';

export let mainDb;
export let debug;

export default {
  name: 'facebook',
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
    };
  },
  meta: {
    automations,
    forms,
    segments,
    inboxIntegrations: [
      {
        kind: INTEGRATION_KINDS.MESSENGER,
        label: 'Facebook messenger',
      },
      {
        kind: INTEGRATION_KINDS.POST,
        label: 'Facebook post',
      },
    ],
  },
  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    context.subdomain = req.hostname;
    context.models = models;

    return context;
  },

  onServerInit: async (options) => {
    mainDb = options.db;

    await initBroker(options.messageBrokerClient);

    await initApp();

    debug = options.debug;
  },
};
