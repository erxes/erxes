import * as dotenv from 'dotenv';
import mongoose = require('mongoose');
import { debugDb } from './debuggers';
import { getEnv } from './utils';

dotenv.config();

const NODE_ENV = getEnv({ name: 'NODE_ENV' });
const MONGO_URL = getEnv({ name: 'MONGO_URL', defaultValue: '' });

mongoose.Promise = global.Promise;

export const connectionOptions: mongoose.ConnectionOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  autoReconnect: true,
  family: 4,
  useFindAndModify: false
};

mongoose.connection
  .on('connected', () => {
    if (NODE_ENV !== 'test') {
      debugDb(`Connected to the database: ${MONGO_URL}`);
    }
  })
  .on('disconnected', () => {
    debugDb(`Disconnected from the database: ${MONGO_URL}`);
  })
  .on('error', error => {
    debugDb(`Database connection error: ${MONGO_URL} ${error}`);
  });

export const connect = (url?: string) => {
  const URI = url || process.env.MONGO_URL;

  return mongoose.connect(URI, connectionOptions);
};

/**
 * Health check status
 */
export const mongoStatus = () => {
  return new Promise((resolve, reject) => {
    mongoose.connection.db.admin().ping((err, result) => {
      if (err) {
        return reject(err);
      }

      return resolve(result);
    });
  });
};
