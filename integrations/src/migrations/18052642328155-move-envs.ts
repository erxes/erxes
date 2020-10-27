import { connect } from '../connection';
import Configs from '../models/Configs';

const ENVS = [
  'FACEBOOK_APP_ID',
  'FACEBOOK_APP_SECRET',
  'FACEBOOK_VERIFY_TOKEN',

  'USE_NATIVE_GMAIL',
  'GOOGLE_GMAIL_TOPIC',
  'GOOGLE_GMAIL_SUBSCRIPTION_NAME',

  'TWITTER_CONSUMER_KEY',
  'TWITTER_CONSUMER_SECRET',
  'TWITTER_ACCESS_TOKEN',
  'TWITTER_ACCESS_TOKEN_SECRET',
  'TWITTER_WEBHOOK_ENV',

  'NYLAS_CLIENT_ID',
  'NYLAS_CLIENT_SECRET',
  'NYLAS_WEBHOOK_CALLBACK_URL',

  'ENCRYPTION_KEY',

  'MICROSOFT_CLIENT_ID',
  'MICROSOFT_CLIENT_SECRET',

  'DAILY_API_KEY',
  'DAILY_END_POINT',
];

module.exports.up = async () => {
  await connect();

  for (const env of ENVS) {
    try {
      await Configs.create({ code: env, value: process.env[env] });
    } catch (e) {
      console.log(e.message);
    }
  }

  try {
    await Configs.create({ code: 'ALGORITHM', value: 'aes-256-cbc' });
  } catch (e) {
    console.log(e.message);
  }
};
