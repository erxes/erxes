const cubejs = require('@cubejs-client/core');
const elasticsearch = require('elasticsearch');
const resolvers = require('./constants.js');

const { CUBEJS_TOKEN, CUBEJS_URL, CUBEJS_DB_URL } = process.env;

const client = new elasticsearch.Client({
  hosts: [CUBEJS_DB_URL]
});

const cubejsApi = cubejs.default(CUBEJS_TOKEN, {
  apiUrl: `${CUBEJS_URL}/cubejs-api/v1`
});

const resolver = async (data, dimensions) => {
  const resolver = resolvers.find(res => res.name === dimensions);

  if (resolver) {
    const foundedValue = [];

    for (let i = 0; i < data.length; i++) {
      value = data[i];

      const prevValue = foundedValue.find(
        founded => founded.name === value[dimensions]
      );

      if (prevValue) {
        value[dimensions] = prevValue.value;
      } else {
        if (value[dimensions]) {
          try {
            const response = await client.get({
              index: resolver.indexname,
              id: value[dimensions]
            });

            foundedValue.push({
              name: value[dimensions],
              value: response._source[resolver.fieldname] || 'unknown'
            });

            value[dimensions] =
              response._source[resolver.fieldname] || 'unknown';
          } catch (e) {
            data.splice(i, 1);
            i--;
          }
        } else {
          data.splice(i, 1);
          i--;
        }
      }
    }

    return data;
  }

  return data;
};

const generateReport = async (req, res) => {
  const { query } = req;

  if (query.timeDimensions[0]) {
    query.timeDimensions[0] = JSON.parse(query.timeDimensions);
  }

  const resultSet = await cubejsApi.load(query);

  if (query.dimensions) {
    const data = await resolver(
      resultSet.loadResponse.data,
      query.dimensions[0]
    );

    resultSet.loadResponse.data = data;
  }

  const result = {
    chartPivot: resultSet.chartPivot(),
    seriesNames: resultSet.seriesNames(),
    tableColumns: resultSet.tableColumns(),
    tablePivot: resultSet.tablePivot()
  };

  res.send(result);
};

module.exports = generateReport;
