import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import * as Redis from 'ioredis';
import * as path from 'path';
import { redisOptions } from './redisClient';

// load environment variables
dotenv.config();

interface IGoogleOptions {
  projectId: string;
  credentials: {
    client_email: string;
    private_key: string;
  };
}

const { PUBSUB_TYPE, NODE_ENV, PROCESS_NAME } = process.env;

// Google pubsub message handler
const commonMessageHandler = payload => {
  return JSON.parse(payload.data.toString());
};

const configGooglePubsub = (): IGoogleOptions => {
  const checkHasConfigFile = fs.existsSync(path.join(__dirname, '..', '/google_cred.json'));

  if (!checkHasConfigFile) {
    throw new Error('Google credentials file not found!');
  }

  const serviceAccount = require('../google_cred.json');

  return {
    projectId: serviceAccount.project_id,
    credentials: {
      client_email: serviceAccount.client_email,
      private_key: serviceAccount.private_key,
    },
  };
};

const createPubsubInstance = () => {
  let pubsub;

  if (NODE_ENV === 'test' || NODE_ENV === 'command' || PROCESS_NAME === 'crons') {
    pubsub = {
      asyncIterator: () => null,
      publish: () => null,
    };

    return pubsub;
  }

  if (PUBSUB_TYPE === 'GOOGLE') {
    const googleOptions = configGooglePubsub();

    const GooglePubSub = require('@axelspringer/graphql-google-pubsub').GooglePubSub;

    return new GooglePubSub(googleOptions, undefined, commonMessageHandler);
  } else {
    return new RedisPubSub({
      connectionListener: error => {
        if (error) {
          console.error(error);
        }
      },
      publisher: new Redis(redisOptions),
      subscriber: new Redis(redisOptions),
    });
  }
};

export const graphqlPubsub = createPubsubInstance();
