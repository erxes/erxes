import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import * as express from 'express';
import { connect } from './connection';
import initFacebook from './facebook/controller';
import Accounts from './models/Accounts';
import Integrations from './models/Integrations';

// load environment variables
dotenv.config();

import { debugInit, debugIntegrations, debugRequest, debugResponse } from './debuggers';

connect();

const app = express();

app.use((req: any, _res, next) => {
  req.rawBody = '';

  req.on('data', chunk => {
    req.rawBody += chunk.toString().replace(/\//g, '\\/');
  });

  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/integrations/remove', async (req, res) => {
  debugRequest(debugIntegrations, req);

  const { integrationId } = req.body;

  await Integrations.deleteOne({ erxesApiId: integrationId });

  debugResponse(debugIntegrations, req);

  return res.json({ status: 'ok ' });
});

app.get('/accounts', async (req, res) => {
  debugRequest(debugIntegrations, req);

  const accounts = await Accounts.find({ kind: req.query.kind });

  debugResponse(debugIntegrations, req, JSON.stringify(accounts));

  return res.json(accounts);
});

app.post('/accounts/remove', async (req, res) => {
  debugRequest(debugIntegrations, req);

  await Accounts.deleteOne({ _id: req.body._id });

  debugResponse(debugIntegrations, req);

  return res.json({ status: 'removed' });
});

// init bots
initFacebook(app);

// Error handling middleware
app.use((error, _req, res, _next) => {
  console.error(error.stack);
  res.status(500).send(error.message);
});

const { PORT } = process.env;

app.listen(PORT, () => {
  debugInit(`Integrations server is running on port ${PORT}`);
});
