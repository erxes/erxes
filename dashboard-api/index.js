const CubejsServer = require('@cubejs-backend/server');
const dotenv = require('dotenv');
const generateReport = require('./controller/controller.js');
const ModifiedElasticSearchDriver = require('./driver.js');

dotenv.config();

const { SCHEMA_PATH } = process.env;

const server = new CubejsServer({
  schemaPath: SCHEMA_PATH || '/schema',
  driverFactory: ({ dataSource }) => {
    return new ModifiedElasticSearchDriver({
      xpack: true,
      dataSource
    });
  }
});

server
  .listen()
  .then(({ app, port }) => {
    app.get('/get', (req, res) => generateReport(req, res));

    console.log(`🚀 Cube.js server is listening on ${port}`);
  })
  .catch(e => {
    console.error('Fatal error during server start: ');
    console.error(e.stack || e);
  });
