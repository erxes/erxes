const cubejs = require('@cubejs-client/core');
const express = require('express');
const CubejsServer = require('@cubejs-backend/server');

const cubejsApi = cubejs.default('123', { apiUrl: 'http://localhost:4300/cubejs-api/v1' });

const server = new CubejsServer();

const app = express();

const { PORT } = process.env;

server
  .listen()
  .then(({ port }) => {
    console.log(`🚀 Cube.js server is listening on ${port}`);
  })
  .catch(e => {
    console.error('Fatal error during server start: ');
    console.error(e.stack || e);
  });

app.listen(4600, () => {
  console.log(`ERXES HELPER RUNNING ON ${4600}`);
});

app.use('/get', async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  const { query } = req;

  if (query.timeDimensions[0]) {
    query.timeDimensions[0] = JSON.parse(query.timeDimensions);
  }

  const resultSet = await cubejsApi.load(query);

  console.log('1231231', resultSet.chartPivot());

  const result = {
    chartPivot: resultSet.chartPivot(),
    seriesNames: resultSet.seriesNames(),
    tableColumns: resultSet.tableColumns(),
    tablePivot: resultSet.tablePivot(),
  };

  res.send(result);
});
