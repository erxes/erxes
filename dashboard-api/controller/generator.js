const { tableSchema } = require('../tablePrefix');
const elasticsearch = require('elasticsearch');

const { CUBEJS_DB_URL } = process.env;

const client = new elasticsearch.Client({
  hosts: [CUBEJS_DB_URL]
});

const generateReport = async query => {
  if (query.filters) {
    const filters = query.filters;

    await Promise.all(
      filters.map(async filter => {
        if (filter.dimension === 'Deals.stageProbability') {
          const should = [];

          filter.values.map(value => {
            should.push({ match: { probability: value } });
          });

          const result = await client.search({
            index: `${tableSchema()}__stages`,
            _source: false,
            body: {
              query: {
                bool: {
                  should
                }
              }
            }
          });

          result.hits.hits.map(async hit => {
            await filter.values.push(hit._id);
          });
        }
      })
    );
  }
  return query;
};

module.exports = generateReport;
