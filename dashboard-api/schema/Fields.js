const elasticsearch = require('elasticsearch');
const { dbUrl } = require('../dbUrl');
const { tableSchema } = require('../tablePrefix');

const url = dbUrl();

const client = new elasticsearch.Client({
  hosts: [url]
});

asyncModule(async () => {
  const dimensions = [];

  const result = await client.search({
    index: 'erxes__fields',
    body: {
      query: {
        match: { groupId: 'WaMyBJk6RdPeFnBSi' }
      }
    }
  });

  result.hits.hits.map(async hit => {
    dimensions.push({
      _id: hit._id,
      text: hit._source.field || hit._source.text
    });
  });

  dimensions.push({
    type: 'createdDate'
  });

  cube('CustomerFields', {
    sql: `SELECT * FROM ${tableSchema()}__field__values WHERE contentType='customer'`,

    dimensions: Object.assign(
      dimensions
        .map(e => {
          if (e.type === 'createdDate') {
            return {
              [`createdDate`]: {
                sql: `${CUBE}."createdDate"`,
                type: `time`
              }
            };
          }
          return {
            [`${e.text}${e._id}`]: {
              sql: `${CUBE}."contentId"`,
              type: `string`
            }
          };
        })
        .reduce((a, b) => Object.assign(a, b))
    )
  });
});
