const resolvers = [
  {
    name: 'Conversations.integrationName',
    indexname: 'erxes__integrations',
    fieldname: 'name'
  },
  {
    name: 'Conversations.integrationKind',
    indexname: 'erxes__integrations',
    fieldname: 'kind'
  },
  {
    name: 'Conversations.firstRespondedUser',
    indexname: 'erxes__users',
    fieldname: 'username'
  },
  {
    name: 'Deals.stageName',
    indexname: 'erxes__stages',
    fieldname: 'name'
  },
  {
    name: 'Deals.stageProbability',
    indexname: 'erxes__stages',
    fieldname: 'probability'
  },
  {
    name: 'Deals.modifiedBy',
    indexname: 'erxes__users',
    fieldname: 'username'
  }
];

module.exports = resolvers;
