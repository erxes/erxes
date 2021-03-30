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
      field: `brand`,
      sql: 'integrationId',
      type: `string`
    },
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
    body: {
      query: {
        bool: {
          should: [
            { match: { contentType: 'customer' } },
            { match: { isDefinedByErxes: false } }
          ]
        }
      }
    }
  });

  const fieldGroupIds = fieldGroups.hits.hits.map(hit => hit._id);

  fieldGroupIds.map(groupId => {
    should.push({ match: { groupId: groupId } });
  });

  const result = await client.search({
    index: `${tableSchema()}__fields`,
    body: {
      query: {
        bool: {
          should
        }
      }
    }
  });

  const camelize = str => {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, '');
  };

  result.hits.hits.map(async hit => {
    dimensions.push({
      _id: hit._id,
      text: camelize(hit._source.field || hit._source.text),
      customField: true,
      title: hit._source.field || hit._source.text
    });
  });

  cube('VisitorProperties', {
    sql: `SELECT * FROM ${tableSchema()}__customers WHERE state='visitor'`,

    dimensions: Object.assign(
      dimensions
        .map(e => {
          if (e.customField === true) {
            return {
              [`${e.text}${e._id}CUSTOM`]: {
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
