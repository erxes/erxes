import CubejsServer from '@cubejs-backend/server';
import dotenv from 'dotenv';
import { generateReport } from './controller/controller.js';

dotenv.config();

const { API_PORT } = process.env;

const server = new CubejsServer();

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
