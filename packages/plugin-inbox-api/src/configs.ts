import * as cors from 'cors';
import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { generateAllDataLoaders } from './dataLoaders';
import { initBroker } from './messageBroker';
import { routeErrorHandling } from '@erxes/api-utils/src/requests';
import {
  identifyCustomer,
  trackCustomEvent,
  trackViewPageEvent,
  updateCustomerProperties
} from './events';
import { generateModels } from './connectionResolver';
import logs from './logUtils';
import tags from './tags';
import segments from './segments';
import forms from './forms';
import * as permissions from './permissions';
import search from './search';
import widgetsMiddleware from './middlewares/widgetsMiddleware';
import { getSubdomain } from '@erxes/api-utils/src/core';
import webhooks from './webhooks';
import cronjobs from './cronjobs/conversations';

export let mainDb;
export let graphqlPubsub;
export let serviceDiscovery;

export let debug;

export default {
  name: 'inbox',
  permissions,
  graphql: async sd => {
    serviceDiscovery = sd;

    return {
      typeDefs: await typeDefs(sd),
      resolvers
    };
  },
  hasSubscriptions: true,
  meta: {
    forms,
    segments,
    tags,
    search,
    logs: { providesActivityLog: true, consumers: logs },
    webhooks,
    cronjobs,
    // for fixing permissions
    permissions
  },
  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    const models = await generateModels(subdomain);

    context.models = models;
    context.dataLoaders = generateAllDataLoaders(models);
    context.subdomain = subdomain;

    return context;
  },
  onServerInit: async options => {
    mainDb = options.db;

    const app = options.app;

    // events
    app.post(
      '/events-receive',
      routeErrorHandling(
        async (req, res) => {
          const { name, customerId, attributes } = req.body;
          const subdomain = getSubdomain(req);

          const response =
            name === 'pageView'
              ? await trackViewPageEvent(subdomain, { customerId, attributes })
              : await trackCustomEvent(subdomain, {
                  name,
                  customerId,
                  attributes
                });

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
          const subdomain = getSubdomain(req);

          const response = await identifyCustomer(subdomain, args);
          return res.json(response);
        },
        res => res.json({})
      )
    );

    app.post(
      '/events-update-customer-properties',
      routeErrorHandling(
        async (req, res) => {
          const subdomain = getSubdomain(req);

          const response = await updateCustomerProperties(subdomain, req.body);
          return res.json(response);
        },
        res => res.json({})
      )
    );

    app.get('/script-manager', cors({ origin: '*' }), widgetsMiddleware);

    initBroker(options.messageBrokerClient);

    debug = options.debug;
    graphqlPubsub = options.pubsubClient;
  }
};
