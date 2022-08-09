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
      field: `status`,
      sql: 'status',
      type: `string`
    },
    {
      field: `tag`,
      sql: `tagIds`,
      type: `string`
    },
    {
      field: `firstName`,
      sql: 'firstName',
      type: `string`
    },
    {
      field: `lastName`,
      sql: 'lastName',
      type: `string`
    },
    {
      field: `email`,
      sql: 'primaryEmail',
      type: `string`
    },
    {
      field: `country`,
      sql: 'location.country',
      type: `string`
    },
    {
      field: `city`,
      sql: 'location.city',
      type: `string`
    },
    {
      field: 'createdDate',
      sql: 'createdAt',
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
              term: { contentType: 'customer' }
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

  cube('VisitorProperties', {
    sql: `SELECT * FROM ${tableSchema()}__customers WHERE state='visitor'`,

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
