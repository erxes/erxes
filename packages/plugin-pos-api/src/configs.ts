import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { generateModels } from './connectionResolver';

import { setupMessageConsumers } from './messageBroker';
import { getSubdomain } from '@erxes/api-utils/src/core';
import * as permissions from './permissions';
import { posInit, posSyncConfig, unfetchOrderInfo } from './routes';
import afterMutations from './afterMutations';
import beforeResolvers from './beforeResolvers';
import automations from './automations';
import forms from './forms';
import segments from './segments';
import dashboards from './dashboards';
import imports from './imports';
import exporter from './exporter';
import payment from './payment';
import { exportFileRunner } from './exporterByUrl';
import cronjobs from './cronjobs';
import loyalties from './loyalties';

export default {
  name: 'pos',
  permissions,
  getHandlers: [
    { path: `/pos-init`, method: posInit },
    { path: `/file-export`, method: exportFileRunner }
  ],
  postHandlers: [
    { path: `/api/unfetch-order-info`, method: unfetchOrderInfo },
    { path: `/pos-sync-config`, method: posSyncConfig }
  ],
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers()
    };
  },
  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    context.subdomain = subdomain;
    context.models = await generateModels(subdomain);

    return context;
  },

  onServerInit: async () => {},
  setupMessageConsumers,
  meta: {
    afterMutations,
    automations,
    forms,
    segments,
    permissions,
    dashboards,
    beforeResolvers,
    imports,
    exporter,
    payment,
    cronjobs,
    loyalties
  }
};
