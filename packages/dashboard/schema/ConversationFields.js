const elasticsearch = require('elasticsearch');
const { dbUrl } = require('../dbUrl');
const { tableSchema } = require('../tablePrefix');

const url = dbUrl();

const client = new elasticsearch.Client({
  hosts: [url]
});

asyncModule(async () => {
  const dimensions = [
    {
      field: `customerFirstName`,
      sql: 'customerId',
      type: `string`
    },
    {
      field: `customerLastName`,
      sql: 'customerId',
      type: `string`
    },
    {
      field: `customerEmail`,
      sql: 'customerId',
      type: `string`
    },
    {
      field: `firstRespondedUser`,
      sql: 'firstRespondedUserId',
      type: `string`
    },
    {
      field: 'integrationName',
      sql: 'integrationId',
      type: `string`
    },
    {
      field: 'integrationType',
      sql: 'integrationId',
      type: `string`
    },
    {
      field: 'tag',
      sql: 'tagIds',
      type: `string`
    },
    {
      field: 'createdDate',
      sql: 'createdAt',
      type: `time`
    },
    {
      field: 'closedDate',
      sql: 'closedAt',
      type: `time`
    },
    {
      field: 'firstRespondedDate',
      sql: 'firstRespondedDate',
      type: `time`
    }
  ];

  const should = [];

  const fieldGroups = await client.search({
    index: `${tableSchema()}__fields_groups`,
    size: 1000,
    body: {
      query: {
        bool: {
          must: [
            {
              term: { contentType: 'conversation' }
            },
            {
              term: { isDefinedByErxes: false }
            }
          ]
        }
      }
    }
  });

  const fieldGroupIds = fieldGroups.hits.hits.map(hit => hit._id);

  fieldGroupIds.map(groupId => {
    should.push({ match: { groupId: groupId } });
  });

  let result = {};

  if (should.length > 0) {
    result = await client.search({
      index: `${tableSchema()}__fields`,
      size: 1000,
      body: {
        query: {
          bool: {
            should
          }
        }
      }
    });
  }

  if (result.hits) {
    result.hits.hits.map(async hit => {
      dimensions.push({
        _id: hit._id,
        customField: true,
        title: hit._source.field || hit._source.text
      });
    });
  }

  cube('ConversationProperties', {
    sql: `SELECT * FROM ${tableSchema()}__conversations`,

    dimensions: Object.assign(
      dimensions
        .map(e => {
          if (e.customField === true) {
            return {
              [`CUSTOM${e._id}`]: {
                sql: `${CUBE}."ownId"`,
                type: `string`,
                title: e.title
              }
            };
          } else {
            return {
              [e.field]: {
                sql: `${CUBE}.${e.sql}`,
                type: e.type
              }
            };
          }
        })
        .reduce((a, b) => Object.assign(a, b))
    )
  });
});
