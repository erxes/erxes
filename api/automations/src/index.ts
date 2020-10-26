import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import * as express from 'express';
import { createServer } from 'http';

import { connect } from './connection';
import { debugBase, debugInit } from './debuggers';
import { initBroker } from './messageBroker';

// load environment variables
dotenv.config();

// connect to mongo database
connect();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Once the bot has booted up its internal services, you can use them to do stuff.

const { PORT } = process.env;

const httpServer = createServer(app);
httpServer.listen(PORT, () => {
  connect().then(async () => {
    initBroker(app).catch(e => {
      debugBase(`Error ocurred during message broker init ${e.message}`);
    });
  })

  debugInit(`Automations server is running on port ${PORT}`);
});
