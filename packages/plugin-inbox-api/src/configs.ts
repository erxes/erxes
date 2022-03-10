import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { generateAllDataLoaders } from './dataLoaders';
import { initBroker } from './messageBroker';
import { IFetchElkArgs } from '@erxes/api-utils/src/types';
import { routeErrorHandling } from '@erxes/api-utils/src/requests';
import { identifyCustomer, trackCustomEvent, trackViewPageEvent, updateCustomerProperty } from './events';
import { generateModels, models, coreModels } from './connectionResolver';
import logConsumers from './logConsumers';

export let mainDb;
export let graphqlPubsub;
export let serviceDiscovery;

export let es: {
  client;
  fetchElk(args: IFetchElkArgs): Promise<any>,
  getMappings(index: string): Promise<any>,
  getIndexPrefix(): string,
};

export let debug;

export default {
  name: 'inbox',
  graphql: async (sd) => {
    serviceDiscovery = sd;

    return {
      typeDefs: await typeDefs(sd),
      resolvers,
    }
  },
  hasSubscriptions: true,
  meta: {
    segments: {
      indexesTypeContentType: {
        conversation: 'conversations',
      },
      contentTypes: ['conversation'],
    },
    tagTypes: ['conversation'],
    logs: { providesActivityLog: true, consumers: logConsumers }
  },
  apolloServerContext: (context) => {
    context.models = models;
    context.coreModels = coreModels;
    context.dataLoaders = generateAllDataLoaders(models);
  },
  onServerInit: async (options) => {
    mainDb = options.db;
    const app = options.app;

    await generateModels('os');

    // events
    app.post(
      '/events-receive',
      routeErrorHandling(
        async (req, res) => {
          const { name, customerId, attributes } = req.body;

          const response =
            name === 'pageView'
              ? await trackViewPageEvent(coreModels, { customerId, attributes })
              : await trackCustomEvent(coreModels, { name, customerId, attributes });

          return res.json(response);
        },
        res => res.json({ status: 'success' })
      )
    );

    app.post(
      '/events-identify-customer',
      routeErrorHandling(
        async (req, res) => {
          const { args } = req.body;

          const response = await identifyCustomer(args);
          return res.json(response);
        },
        res => res.json({})
      )
    );

    app.post(
      '/events-update-customer-property',
      routeErrorHandling(
        async (req, res) => {
          const response = await updateCustomerProperty(coreModels, req.body);
          return res.json(response);
        },
        res => res.json({})
      )
    );


    initBroker(options.messageBrokerClient)

    debug = options.debug;
    graphqlPubsub = options.pubsubClient;
    es = options.elasticsearch;
  },
}