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
    fieldname: 'username'
  },
  {
    name: 'Conversations.assignedUser',
    indexname: `${tableSchema()}__users`,
    fieldname: 'username'
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
    fieldname: 'username'
  },
  {
    name: 'Deals.assignedUser',
    indexname: `${tableSchema()}__users`,
    fieldname: 'username'
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
    fieldname: 'username'
  },
  {
    name: 'Tasks.assignedUser',
    indexname: `${tableSchema()}__users`,
    fieldname: 'username'
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
    fieldname: 'username'
  },
  {
    name: 'Tickets.assignedUser',
    indexname: `${tableSchema()}__users`,
    fieldname: 'username'
  },

  {
    name: 'Contacts.tag',
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
  }
};

module.exports = { resolvers, filterResolvers };
