import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { initBroker } from './messageBroker';
import { initMemoryStorage } from './inmemoryStorage';
import apiConnect from './apiCollections';

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
  apolloServerContext: context => {
    return context;
  },
  onServerInit: async options => {
    await apiConnect();

    initBroker(options.messageBrokerClient);

    initMemoryStorage();

    graphqlPubsub = options.pubsubClient;

    debug = options.debug;
  },
  meta: {
    logs: { providesActivityLog: true }
  }
};
