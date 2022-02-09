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
  graphql: async serviceDiscovery => {
    return {
      typeDefs: await typeDefs(serviceDiscovery),
      resolvers
    };
  },
  importTypes: [],
  hasSubscriptions: false,
  segment: {
    indexesTypeContentType: {
      customer: 'customers',
      company: 'companies'
    },
    contentTypes: ['customer', 'company'],
    esTypesMapQueue: 'contacts:segments:esTypesMap',
    initialSelectorQueue: 'contacts:segments:initialSelector',
    associationTypesQueue: 'contacts:segments:associationTypes'
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
