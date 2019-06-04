import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import * as express from 'express';
import initFacebook from './facebook/controller';
import Accounts from './models/Accounts';
import Integrations from './models/Integrations';

// load environment variables
dotenv.config();

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

app.post('/integrations/create', async (req, res) => {
  const { kind, accountId, integrationId, data } = req.body;

  if (kind === 'facebook') {
    await Integrations.create({
      kind,
      accountId,
      erxesApiId: integrationId,
      facebookPageIds: JSON.parse(data).pageIds,
    });
  }

  return res.json({ status: 'ok ' });
});

app.get('/accounts', async (req, res) => {
  const accounts = await Accounts.find({ kind: req.query.kind });

  return res.json(accounts);
});

app.post('/accounts/remove', async (req, res) => {
  await Accounts.remove({ _id: req.body._id });

  return res.json({ status: 'removed' });
});

// init bots
initFacebook(app);

const { PORT } = process.env;

app.listen(PORT, () => {
  console.log(`Integrations server is running on port ${PORT}`);
});
