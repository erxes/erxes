const cubejs = require('@cubejs-client/core');
const elasticsearch = require('elasticsearch');
const { resolvers } = require('./constants.js');

const { CUBEJS_URL, CUBEJS_DB_URL } = process.env;

const client = new elasticsearch.Client({
  hosts: [CUBEJS_DB_URL]
});

const generateReport = async (req, res) => {
  const { query } = req;

  const { dashboardToken } = query;

  let resultSet = {};

  const dashboardQuery = JSON.parse(query.dashboardQuery);

  const cubejsApi = cubejs.default(dashboardToken, {
    apiUrl: `${CUBEJS_URL}/cubejs-api/v1`
  });

  try {
    resultSet = await cubejsApi.load(dashboardQuery);
  } catch (e) {
    if (!e.message.includes('Values required for filter')) {
      res.send('No data');
    }
  }

  if (resultSet.loadResponse.query.dimensions[0]) {
    const dimensions = resultSet.loadResponse.query.dimensions[0];
    const resolver = resolvers.find(res => res.name === dimensions);

    if (resolver) {
      await Promise.all(
        resultSet.loadResponse.data.map(async data => {
          try {
            const response = await client.get({
              index: resolver.indexname,
              id: data[dimensions]
            });

            console.log(response);

            data[dimensions] =
              response._source[resolver.fieldname] || 'unknown';
          } catch (e) {
            data[dimensions] = 'unknown';
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
