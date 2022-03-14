import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { generateAllDataLoaders } from './dataLoaders';
import { initBroker } from './messageBroker';
import { IFetchElkArgs } from '@erxes/api-utils/src/types';
import { routeErrorHandling } from '@erxes/api-utils/src/requests';
import { identifyCustomer, trackCustomEvent, trackViewPageEvent, updateCustomerProperty } from './events';
import { generateModels, models, coreModels, getSubdomain } from './connectionResolver';
import logs from './logs';
import tags from '../tags';

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
    tags,
    logs: { providesActivityLog: true, consumers: logs }
  },
  apolloServerContext: (context) => {
    const subdomain = 'os';

    context.models = models;
    context.coreModels = coreModels;
    context.dataLoaders = generateAllDataLoaders(models);
    context.subdomain = subdomain;

    return context;
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
          const subdomain = getSubdomain(req.hostname);

          const response = await identifyCustomer(subdomain, args);
          return res.json(response);
        },
        res => res.json({})
      )
    );

    app.post(
      '/events-update-customer-property',
      routeErrorHandling(
        async (req, res) => {
          const subdomain = getSubdomain(req.hostname);

          const response = await updateCustomerProperty(coreModels, subdomain, req.body);
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