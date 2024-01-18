import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { initBroker } from './messageBroker';
import { generateModels } from './connectionResolver';
import * as permissions from './permissions';
import { getSubdomain } from '@erxes/api-utils/src/core';
import cronjobs from './cronjobs/automations';
import tags from './tags';
import logs from './logUtils';

export let mainDb;
export let debug;

export default {
  name: 'automations',
  permissions,
  // for fixing permissions
  meta: {
    permissions,
    cronjobs,
    tags,
    logs: { providesActivityLog: true, consumers: logs },
  },
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
    };
  },
  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    context.models = await generateModels(subdomain);
    context.subdomain = subdomain;

    return context;
  },
  onServerInit: async (options) => {
    mainDb = options.db;

    console.log('on server init .....');

    initBroker(options.messageBrokerClient);

    debug = options.debug;
  },
};
