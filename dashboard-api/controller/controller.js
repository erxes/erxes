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

  const queryDimensions = resultSet.loadResponse.query.dimensions;

  if (queryDimensions[0]) {
    await Promise.all(
      queryDimensions.map(async dimension => {
        if (dimension.slice(dimension.length - 6) === 'CUSTOM') {
          const shemaName = queryDimensions[0].split('.')[0];

          const index =
            shemaName === 'ConversationProperties'
              ? 'erxes__conversations'
              : 'erxes__customers';

          const customFieldId = dimension
            .slice(dimension.length - 23)
            .slice(0, 17);

          await Promise.all(
            resultSet.loadResponse.data.map(async data => {
              try {
                const response = await client.get({
                  index,
                  id: data[dimension]
                });

                const customFieldDatas = response._source.customFieldsData;

                const customField = customFieldDatas.find(customFieldData => {
                  return customFieldData.field === customFieldId;
                });

                data[dimension] = customField.value || ' ';
              } catch (e) {
                data[dimension] = ' ';
              }
            })
          );
        } else {
          const resolver = resolvers.find(res => res.name === dimension);

          if (resolver) {
            await Promise.all(
              resultSet.loadResponse.data.map(async data => {
                try {
                  const response = await client.get({
                    index: resolver.indexname,
                    id: data[dimension]
                  });

                  const fieldName = resolver.fieldname.split('.');

                  if (fieldName.length == 2) {
                    data[dimension] =
                      response._source[fieldName[0]][fieldName[1]] || 'unknown';
                  } else {
                    data[dimension] = response._source[fieldName] || 'unknown';
                  }
                } catch (e) {
                  data[dimension] = 'unknown';
                }
              })
            );
          }
        }
      })
    );
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
