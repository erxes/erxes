import * as bodyParser from 'body-parser';
import { FacebookAdapter } from 'botbuilder-adapter-facebook';
import { Botkit } from 'botkit';
import * as dotenv from 'dotenv';
import * as express from 'express';
import { connect } from './connection';

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

const adapter = new FacebookAdapter({
  verify_token: process.env.FACEBOOK_VERIFY_TOKEN,
  access_token: process.env.FACEBOOK_ACCESS_TOKEN,
  app_secret: process.env.FACEBOOK_APP_SECRET,
});

const controller = new Botkit({
  webhook_uri: '/facebook/receive',
  webserver: app,
  adapter,
});

// Once the bot has booted up its internal services, you can use them to do stuff.
controller.ready(() => {
  // listen for a message containing the world "hello", and send a reply
  controller.hears('hello', 'message', async (bot, message) => {
    // do something!
    await bot.reply(message, 'Hello human');
  });

  // wait for a new user to join a channel, then say hi
  controller.on('channel_join', async (bot, message) => {
    await bot.reply(message, 'Welcome to the channel!');
  });
});

const { PORT } = process.env;

app.listen(PORT, () => {
  console.log(`Integrations server is running on port ${PORT}`);
});
