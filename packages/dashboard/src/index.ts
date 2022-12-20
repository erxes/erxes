import * as dotenv from 'dotenv';
import * as jwt from 'jsonwebtoken';

import { CubejsServer } from '@cubejs-backend/server';

dotenv.config();

const { CUBEJS_API_SECRET, DB_NAME } = process.env;

const server = new CubejsServer({});

server
  .listen()
  .then(async ({ app, port }) => {
    app.get('/get-token', async (_req, res) => {
      const dashboardToken = jwt.sign({}, CUBEJS_API_SECRET || 'secret', {
        expiresIn: '10day'
      });

      return res.send({
        dashboardToken
      });
    });

    console.log(`🚀 Cube.js server is listening on ${port} dbname ${DB_NAME}`);
  })
  .catch(e => {
    console.error('Fatal error during server start: ');
    console.error(e.stack || e);
  });
