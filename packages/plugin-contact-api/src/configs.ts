import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import apiConnect from './apiCollections';

import { generateAllDataLoaders } from './dataLoaders';
import { initBroker } from './messageBroker';
import { IFetchElkArgs } from '@erxes/api-utils/src/types';
import { routeErrorHandling } from '@erxes/api-utils/src/requests';
import {
  identifyCustomer,
  trackCustomEvent,
  trackViewPageEvent,
  updateCustomerProperty
} from './events';

export let graphqlPubsub;

export let es: {
  client;
  fetchElk(args: IFetchElkArgs): Promise<any>;
  getMappings(index: string): Promise<any>;
  getIndexPrefix(): string;
};

export let debug;

export default {
  name: 'contact',
  graphql: {
    typeDefs,
    resolvers
  },
  apolloServerContext: context => {
    context.dataLoaders = generateAllDataLoaders();
  },
  onServerInit: async options => {
    await apiConnect();

    const app = options.app;

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

    initBroker(options.messageBrokerClient);

    debug = options.debug;
    graphqlPubsub = options.pubsubClient;
    es = options.elasticsearch;
  }
};
