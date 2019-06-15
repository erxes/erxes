import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as dotenv from 'dotenv';
import * as express from 'express';
import { connect } from './connection';
import { debugInit, debugIntegrations } from './debuggers';
import initFacebook from './facebook/controller';
import Accounts from './models/Accounts';
import Integrations from './models/Integrations';

// load environment variables
dotenv.config();

connect();

cors();

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

app.post('/integrations/remove', async (req, res) => {
  debugIntegrations(
    `Receiving integrations/remove request from ${req.headers.host}, body: ${JSON.stringify(req.body)}`,
  );

  const { integrationId } = req.body;

  await Integrations.deleteOne({ erxesApiId: integrationId });

  debugIntegrations(`Responding integrations/remove request to ${req.headers.host} with success`);

  return res.json({ status: 'ok ' });
});

app.get('/accounts', async (req, res) => {
  debugIntegrations(`Receiving accounts request from ${req.headers.host}, queryParams: ${JSON.stringify(req.query)}`);

  const accounts = await Accounts.find({ kind: req.query.kind });

  debugIntegrations(`Responding accounts request to ${req.headers.host} with ${JSON.stringify(accounts)}`);

  return res.json(accounts);
});

app.post('/accounts/remove', async (req, res) => {
  debugIntegrations(`Receiving accounts/remove request from ${req.headers.host}, body: ${JSON.stringify(req.body)}`);

  await Accounts.deleteOne({ _id: req.body._id });

  debugIntegrations(`Responding accounts/remove request to ${req.headers.host} with success`);

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
