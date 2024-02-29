import * as serverTiming from 'server-timing';
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
  updateCustomerProperties,
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
import automations from './automations';
import cronjobs from './cronjobs/conversations';
import dashboards from './dashboards';
import webhookMiddleware from './middlewares/webhookMiddleware';
import { NOTIFICATION_MODULES } from './constants';
import payment from './payment';
import reports from './reports';
import app from '@erxes/api-utils/src/app';
import exporter from './exporter';

export let debug;

export default {
  name: 'inbox',
  permissions,
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers,
    };
  },
  hasSubscriptions: true,
  subscriptionPluginPath: require('path').resolve(
    __dirname,
    'graphql',
    'subscriptionPlugin.js',
  ),
  meta: {
    reports,
    forms,
    segments,
    tags,
    search,
    logs: { providesActivityLog: true, consumers: logs },
    webhooks,
    automations,
    cronjobs,
    permissions,
    dashboards,
    notificationModules: NOTIFICATION_MODULES,
    payment,
    exporter,
  },
  apolloServerContext: async (context, req, res) => {
    const subdomain = getSubdomain(req);

    const models = await generateModels(subdomain);

    context.models = models;
    context.dataLoaders = generateAllDataLoaders(models);
    context.subdomain = subdomain;

    context.serverTiming = {
      startTime: res.startTime,
      endTime: res.endTime,
      setMetric: res.setMetric,
    };

    return context;
  },
  middlewares: [(serverTiming as any)()],
  onServerInit: async (options) => {
    // events
    app.post(
      '/events-receive',
      routeErrorHandling(
        async (req, res) => {
          const { name, triggerAutomation, customerId, attributes } = req.body;
          const subdomain = getSubdomain(req);

          const response =
            name === 'pageView'
              ? await trackViewPageEvent(subdomain, { customerId, attributes })
              : await trackCustomEvent(subdomain, {
                  name,
                  triggerAutomation,
                  customerId,
                  attributes,
                });

          return res.json(response);
        },
        (res) => res.json({ status: 'success' }),
      ),
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
        (res) => res.json({}),
      ),
    );

    app.post(
      '/events-update-customer-properties',
      routeErrorHandling(
        async (req, res) => {
          const subdomain = getSubdomain(req);

          const response = await updateCustomerProperties(subdomain, req.body);
          return res.json(response);
        },
        (res) => res.json({}),
      ),
    );

    app.get('/script-manager', cors({ origin: '*' }), widgetsMiddleware);
    app.post('/webhooks/:id', webhookMiddleware);

    initBroker();

    debug = options.debug;
  },
};
