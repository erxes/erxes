import app from '@erxes/api-utils/src/app';
import { getSubdomain } from '@erxes/api-utils/src/core';
import telnyx from './api/telnyx';
import automations from './automations';
import { generateModels } from './connectionResolver';
import resolvers from './graphql/resolvers/index';
import typeDefs from './graphql/typeDefs';
import logs from './logUtils';
import { setupMessageConsumers } from './messageBroker';
import * as permissions from './permissions';
import tags from './tags';
import { engageTracker } from './trackers/engageTracker';
import webhooks from './webhooks';

export default {
  name: 'engages',
  permissions,
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers
    };
  },
  segment: { schemas: [] },
  hasSubscriptions: false,
  meta: {
    tags,
    logs: { consumers: logs },
    webhooks,
    permissions,
    automations
  },
  postHandlers: [{ path: `/service/engage/tracker`, method: engageTracker }],
  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    context.dataloaders = {};

    context.models = await generateModels(subdomain);
    context.subdomain = subdomain;

    return context;
  },
  onServerInit: async () => {
    // Insert routes below
    app.use('/telnyx', telnyx);
  },
  setupMessageConsumers
};
