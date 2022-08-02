const elasticsearch = require('elasticsearch');
const { filterResolvers } = require('./constants');

const { CUBEJS_DB_URL } = process.env;

const client = new elasticsearch.Client({
  hosts: [CUBEJS_DB_URL]
});

const generateReport = async query => {
  if (query.filters) {
    const filters = query.filters;

    await Promise.all(
      filters.map(async filter => {
        if (filterResolvers[filter.dimension]) {
          const resolver = filterResolvers[filter.dimension];
          const should = [];
          const field = resolver.field;

          filter.values.map(value => {
            should.push({ match: { [field]: value } });
          });

          const result = await client.search({
            index: resolver.index,
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
