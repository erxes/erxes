const { tableSchema } = require('../tablePrefix');

const resolvers = [
  {
    name: 'Conversations.integrationName',
    indexname: `${tableSchema()}__integrations`,
    fieldname: 'name'
  },
  {
    name: 'Conversations.integrationType',
    indexname: `${tableSchema()}__integrations`,
    fieldname: 'kind'
  },

  {
    name: 'Conversations.tag',
    indexname: `${tableSchema()}__tags`,
    fieldname: 'name'
  },

  {
    name: 'Conversations.firstRespondedUser',
    indexname: `${tableSchema()}__users`,
    fieldname: 'details.fullName'
  },
  {
    name: 'Conversations.assignedUser',
    indexname: `${tableSchema()}__users`,
    fieldname: 'details.fullName'
  },
  {
    name: 'Deals.stageName',
    indexname: `${tableSchema()}__stages`,
    fieldname: 'name'
  },
  {
    name: 'Deals.stageProbability',
    indexname: `${tableSchema()}__stages`,
    fieldname: 'probability'
  },

  {
    name: 'Deals.modifiedBy',
    indexname: `${tableSchema()}__users`,
    fieldname: 'details.fullName'
  },
  {
    name: 'Deals.assignedUser',
    indexname: `${tableSchema()}__users`,
    fieldname: 'details.fullName'
  },
  {
    name: 'Tasks.stageName',
    indexname: `${tableSchema()}__stages`,
    fieldname: 'name'
  },
  {
    name: 'Tasks.stageProbability',
    indexname: `${tableSchema()}__stages`,
    fieldname: 'probability'
  },
  {
    name: 'Tasks.modifiedBy',
    indexname: `${tableSchema()}__users`,
    fieldname: 'details.fullName'
  },
  {
    name: 'Tasks.assignedUser',
    indexname: `${tableSchema()}__users`,
    fieldname: 'details.fullName'
  },
  {
    name: 'Tickets.stageName',
    indexname: `${tableSchema()}__stages`,
    fieldname: 'name'
  },
  {
    name: 'Tickets.stageProbability',
    indexname: `${tableSchema()}__stages`,
    fieldname: 'probability'
  },

  {
    name: 'Tickets.modifiedBy',
    indexname: `${tableSchema()}__users`,
    fieldname: 'details.fullName'
  },
  {
    name: 'Tickets.assignedUser',
    indexname: `${tableSchema()}__users`,
    fieldname: 'details.fullName'
  },

  {
    name: 'Customers.tag',
    indexname: `${tableSchema()}__tags`,
    fieldname: 'name'
  },

  {
    name: 'Leads.tag',
    indexname: `${tableSchema()}__tags`,
    fieldname: 'name'
  },

  {
    name: 'Visitors.tag',
    indexname: `${tableSchema()}__tags`,
    fieldname: 'name'
  },

  {
    name: 'Companies.tag',
    indexname: `${tableSchema()}__tags`,
    fieldname: 'name'
  }
];

const filterResolvers = {
  'Deals.stageProbability': {
    index: `${tableSchema()}__stages`,
    field: 'probability'
  },

  'Tasks.stageProbability': {
    index: `${tableSchema()}__stages`,
    field: 'probability'
  },
  'Tickets.stageProbability': {
    index: `${tableSchema()}__stages`,
    field: 'probability'
  },

  'Conversations.brand': {
    index: `${tableSchema()}__integrations`,
    field: 'brandId'
  },

  'Customers.brand': {
    index: `${tableSchema()}__integrations`,
    field: 'brandId'
  },

  'Leads.brand': {
    index: `${tableSchema()}__integrations`,
    field: 'brandId'
  },

  'Visitors.brand': {
    index: `${tableSchema()}__integrations`,
    field: 'brandId'
  }
};

module.exports = { resolvers, filterResolvers };
