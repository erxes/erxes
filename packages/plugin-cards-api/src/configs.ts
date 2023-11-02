import * as serverTiming from 'server-timing';

import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { initBroker } from './messageBroker';
import * as permissions from './permissions';
import { routeErrorHandling } from '@erxes/api-utils/src/requests';
import { buildFile } from './exporterByUrl';
import segments from './segments';
import forms from './forms';
import logs from './logUtils';
import { generateModels } from './connectionResolver';
import imports from './imports';
import internalNotes from './internalNotes';
import automations from './automations';
import search from './search';
import { getSubdomain } from '@erxes/api-utils/src/core';
import webhooks from './webhooks';
import documents from './documents';
import tags from './tags';
import exporter from './exporter';
import cronjobs from './cronjobs/common';
import dashboards from './dashboards';
import reports from './reports';

import { NOTIFICATION_MODULES } from './constants';

export let mainDb;
export let graphqlPubsub;
export let serviceDiscovery;

export let debug;

export default {
  name: 'cards',
  permissions,
  graphql: async sd => {
    serviceDiscovery = sd;

    return {
      typeDefs: await typeDefs(sd),
      resolvers
    };
  },
  hasSubscriptions: true,
  hasDashboard: true,

  meta: {
    cronjobs,
    reports,
    forms,
    logs: { providesActivityLog: true, consumers: logs },
    segments,
    automations,
    imports,
    exporter,
    internalNotes,
    search,
    webhooks,
    tags,
    permissions,
    documents,
    dashboards,
    notificationModules: NOTIFICATION_MODULES
  },

  apolloServerContext: async (context, req, res) => {
    const subdomain = getSubdomain(req);

    context.models = await generateModels(subdomain);
    context.subdomain = subdomain;

    context.serverTiming = {
      startTime: res.startTime,
      endTime: res.endTime,
      setMetric: res.setMetric
    };

    return context;
  },
  middlewares: [(serverTiming as any)()],
  onServerInit: async options => {
    mainDb = options.db;

    const app = options.app;

    app.get(
      '/file-export',
      routeErrorHandling(async (req: any, res) => {
        const { query } = req;

        const subdomain = getSubdomain(req);
        const models = await generateModels(subdomain);

        const result = await buildFile(models, subdomain, query);

        res.attachment(`${result.name}.xlsx`);

        return res.send(result.response);
      })
    );

    initBroker(options.messageBrokerClient);

    console.log('Debug ....');

    debug = options.debug;
    graphqlPubsub = options.pubsubClient;
  }
};
