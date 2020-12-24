const cubejs = require('@cubejs-client/core');
const elasticsearch = require('elasticsearch');
const resolvers = require('./constants.js');

const { CUBEJS_URL, CUBEJS_DB_URL } = process.env;

const client = new elasticsearch.Client({
  hosts: [CUBEJS_DB_URL]
});

const generateReport = async (req, res) => {
  const { query } = req;

  const { dashboardToken } = query;

  const dashboardQuery = JSON.parse(query.dashboardQuery);

  const cubejsApi = cubejs.default(dashboardToken, {
    apiUrl: `${CUBEJS_URL}/cubejs-api/v1`
  });

  const resultSet = await cubejsApi.load(dashboardQuery);

  if (resultSet.loadResponse.query.dimensions[0]) {
    const dimensions = resultSet.loadResponse.query.dimensions[0];
    const resolver = resolvers.find(res => res.name === dimensions);

    if (resolver) {
      await Promise.all(
        resultSet.loadResponse.data.map(async data => {
          if (resolver.isMulti) {
            try {
              const response = await client.get({
                index: resolver.indexname,
                id: data[dimensions]
              });

              const secondResponse = await client.get({
                index: resolver.secondIndexname,
                id: response._source[resolver.relationField]
              });
              data[dimensions] =
                secondResponse._source[resolver.fieldname] || 'unknown';
            } catch (e) {
              data[dimensions] = 'unknown';
            }
          } else {
            try {
              const response = await client.get({
                index: resolver.indexname,
                id: data[dimensions]
              });

              data[dimensions] =
                response._source[resolver.fieldname] || 'unknown';
            } catch (e) {
              data[dimensions] = 'unknown';
            }
          }
        })
      );
    }
  }

  const result = {
    chartPivot: resultSet.chartPivot(),
    seriesNames: resultSet.seriesNames(),
    tableColumns: resultSet.tableColumns(),
    tablePivot: resultSet.tablePivot(),
    totalRow: resultSet.totalRow()
  };

  res.send(result);
};

module.exports = generateReport;
