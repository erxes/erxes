import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import apiConnect from  './apiCollections';

import { generateAllDataLoaders } from './dataLoaders';
import { initBroker } from './messageBroker';
import { IFetchElkArgs } from '@erxes/api-utils/src/types';
import { routeErrorHandling } from '@erxes/api-utils/src/requests';
import { identifyCustomer, trackCustomEvent, trackViewPageEvent, updateCustomerProperty } from './events';
import { generateModels, models, coreModels } from './connectionResolver';

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
    logs: { providesActivityLog: true }
  },
  apolloServerContext: (context) => {
    context.dataLoaders = generateAllDataLoaders();
    context.models = models;
    context.coreModels = coreModels;
  },
  onServerInit: async (options) => {
    await apiConnect();

    const app = options.app;
    mainDb = options.db;

    await generateModels('os');

    // events
    app.post(
      '/events-receive',
      routeErrorHandling(
        async (req, res) => {
          const { name, customerId, attributes } = req.body;

          const response =
            name === 'pageView'
              ? await trackViewPageEvent({ customerId, attributes })
              : await trackCustomEvent({ name, customerId, attributes });

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
          const response = await updateCustomerProperty(req.body);
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