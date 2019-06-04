import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import * as express from 'express';
import initFacebook from './facebook/controller';

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

// init bots
initFacebook(app);

const { PORT } = process.env;

app.listen(PORT, () => {
  console.log(`Integrations server is running on port ${PORT}`);
});
