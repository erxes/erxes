const { tableSchema } = require('../tablePrefix');

const resolvers = [
  {
    name: 'Conversations.integrationName',
    indexname: `${tableSchema()}__integrations`,
    fieldname: 'name'
  },
  {
    name: 'Conversations.integrationKind',
    indexname: `${tableSchema()}__integrations`,
    fieldname: 'kind'
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
  }
];

const filterResolvers = {
  'Deals.stageProbability': {
    index: `${tableSchema()}__stages`,
    field: 'probability'
  },
  'Conversations.brand': {
    index: `${tableSchema()}__integrations`,
    field: 'brandId'
  }
};

module.exports = { resolvers, filterResolvers };
