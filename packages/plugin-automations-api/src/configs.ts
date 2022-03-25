import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { initBroker } from './messageBroker';
import { generateCoreModels, generateModels } from './connectionResolver';

export let mainDb;
export let debug;
export let graphqlPubsub;
export let serviceDiscovery;

export default {
  name: 'automations',
  permissions: {
    automations: {
      name: 'automations',
      description: 'Automations',
      actions: [
        {
          name: 'automationAll',
          description: 'All',
          use: [
            'showAutomations',
            'automationsAdd',
            'automationsEdit',
            'automationsRemove'
          ]
        },
        {
          name: 'showAutomations',
          description: 'Show automations'
        },
        {
          name: 'automationsAdd',
          description: 'Add automations'
        },
        {
          name: 'automationsEdit',
          description: 'Edit automations'
        },
        {
          name: 'automationsRemove',
          description: 'Remove automations'
        }
      ]
    },
  },
  graphql: async (sd) => {
    serviceDiscovery = sd;

    return {
      typeDefs: await typeDefs(sd),
      resolvers: await resolvers(sd)
    }
  },
  apolloServerContext: async (context) => {
    const subdomain = 'os';

    context.models = await generateModels(subdomain);
    context.coreModels = await generateCoreModels(subdomain);
    context.subdomain = subdomain;

    return context;
  },
  onServerInit: async options => {
    mainDb = options.db;

    initBroker(options.messageBrokerClient);

    graphqlPubsub = options.pubsubClient;

    debug = options.debug;
  },
  meta: {
    logs: { providesActivityLog: true }
  }
};
