import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { initBroker } from './messageBroker';
import { generateModels, models } from './connectionResolver';
import permissions from './permissions';
import forms from './forms';

export let mainDb;
export let debug;
export let serviceDiscovery;

export default {
  name: 'forms',
  permissions,
  graphql: async sd => {
    serviceDiscovery = sd;

    return {
      typeDefs: await typeDefs(sd),
      resolvers: await resolvers(sd)
    };
  },

  meta: {
    forms
  },

  apolloServerContext: context => {
    const subdomain = 'os';
    context.models = models;
    context.subdomain = subdomain;

    return context;
  },
  onServerInit: async options => {
    mainDb = options.db;

    await generateModels('os');

    initBroker(options.messageBrokerClient);

    debug = options.debug;
  }
};
