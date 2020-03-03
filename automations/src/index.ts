import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import * as express from 'express';
import { connect } from './connection';
import './messageBroker';

// load environment variables
dotenv.config();

// connect to mongo database
connect();

const app = express();

app.use((req: any, _res, next) => {
  req.rawBody = '';

  req.on('data', chunk => {
    req.rawBody += chunk;
  });

  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Once the bot has booted up its internal services, you can use them to do stuff.

const { PORT } = process.env;

app.listen(PORT, () => {
  console.log(`Automations server is running on port ${PORT}`);
});
