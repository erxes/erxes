import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { initBroker, sendSegmentsMessage } from './messageBroker';
import { IFetchElkArgs } from '@erxes/api-utils/src/types';
import { routeErrorHandling } from '@erxes/api-utils/src/requests';
import {
  identifyCustomer,
  trackCustomEvent,
  trackViewPageEvent,
  updateCustomerProperty
} from './events';
import { buildFile } from './exporter';
import segments from './segments';
import forms from './forms';
import {
  generateModels,
  getSubdomain
} from './connectionResolver';
import logs from './logUtils';
import imports from './imports';
import tags from './tags'
import internalNotes from './internalNotes';
import automations from './automations';

export let mainDb;
export let graphqlPubsub;
export let serviceDiscovery;

export let es: {
  client;
  fetchElk(args: IFetchElkArgs): Promise<any>;
  getMappings(index: string): Promise<any>;
  getIndexPrefix(): string;
};

export let debug;

export default {
  name: 'contacts',
  permissions: {
    companies: {
      name: 'companies',
      description: 'Companies',
      actions: [
        {
          name: 'companiesAll',
          description: 'All',
          use: [
            'companiesAdd',
            'companiesEdit',
            'companiesRemove',
            'companiesMerge',
            'showCompanies',
            'showCompaniesMain',
            'exportCompanies'
          ]
        },
        {
          name: 'companiesAdd',
          description: 'Add companies'
        },
        {
          name: 'companiesEdit',
          description: 'Edit companies'
        },
        {
          name: 'companiesRemove',
          description: 'Remove companies'
        },
        {
          name: 'companiesMerge',
          description: 'Merge companies'
        },
        {
          name: 'showCompanies',
          description: 'Show companies'
        },
        {
          name: 'showCompaniesMain',
          description: 'Show companies main'
        },
        {
          name: 'exportCompanies',
          description: 'Export companies to xls file'
        }
      ]
    },
    customers: {
      name: 'customers',
      description: 'Customers',
      actions: [
        {
          name: 'customersAll',
          description: 'All',
          use: [
            'showCustomers',
            'customersAdd',
            'customersEdit',
            'customersMerge',
            'customersRemove',
            'exportCustomers',
            'customersChangeState'
          ]
        },
        {
          name: 'exportCustomers',
          description: 'Export customers'
        },
        {
          name: 'showCustomers',
          description: 'Show customers'
        },
        {
          name: 'customersAdd',
          description: 'Add customer'
        },
        {
          name: 'customersEdit',
          description: 'Edit customer'
        },
        {
          name: 'customersMerge',
          description: 'Merge customers'
        },
        {
          name: 'customersRemove',
          description: 'Remove customers'
        },
        {
          name: 'customersChangeState',
          description: 'Change customer state'
        }
      ]
    }
  },
  graphql: async sd => {
    serviceDiscovery = sd;

    return {
      typeDefs: await typeDefs(sd),
      resolvers
    };
  },

  hasSubscriptions: true,
  meta: {
    imports,
    segments,
    automations,
    forms,
    logs: { consumers: logs },
    tags,
    internalNotes
  },
  apolloServerContext: async context => {
    const subdomain = 'os';

    context.models = await generateModels(subdomain);
    context.subdomain = subdomain;
  },
  onServerInit: async options => {
    const app = options.app;
    mainDb = options.db;

    await generateModels('os');

    app.get(
      '/file-export',
      routeErrorHandling(async (req: any, res) => {
        const { query, user } = req;
        const { segment } = query;
        const subdomain = getSubdomain(req.hostname);
        const models = await generateModels(subdomain);

        const result = await buildFile(
          models,
          subdomain,
          query,
          user
        );

        res.attachment(`${result.name}.xlsx`);

        if (segment) {
          try {
            sendSegmentsMessage({
              subdomain,
              action: 'removeSegment',
              data: { segmentId: segment }
            });
          } catch (e) {
            console.log((e as Error).message);
          }
        }

        return res.send(result.response);
      })
    );

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
          const subdomain = getSubdomain(req.hostname);
          const models = await generateModels(subdomain);

          const response = await identifyCustomer(models, subdomain, args);
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
          const models = await generateModels(subdomain);

          const response = await updateCustomerProperty(models, req.body);
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
