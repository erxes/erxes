const CubejsServer = require('@cubejs-backend/server');
const dotenv = require('dotenv');
const generateReport = require('./controller/controller.js');
const generateQuery = require('./controller/generator.js');
const ModifiedElasticSearchDriver = require('./driver.js');
const jwt = require('jsonwebtoken');

dotenv.config();

const { SCHEMA_PATH, CUBEJS_API_SECRET } = process.env;

const server = new CubejsServer({
  schemaPath: SCHEMA_PATH || '/schema',
  driverFactory: ({ dataSource }) => {
    return new ModifiedElasticSearchDriver({
      xpack: true,
      dataSource
    });
  },
  queryTransformer: async query => {
    await generateQuery(query);
    return query;
  }
});

server
  .listen()
  .then(({ app, port }) => {
    app.get('/get', (req, res) => generateReport(req, res));
    app.get('/get-token', (req, res) => {
      const dashboardToken = jwt.sign({}, CUBEJS_API_SECRET || 'secret', {
        expiresIn: '10day'
      });

      return res.send({
        dashboardToken: dashboardToken
      });
    });

    console.log(`🚀 Cube.js server is listening on ${port}`);
  })
  .catch(e => {
    console.error('Fatal error during server start: ');
    console.error(e.stack || e);
  });
