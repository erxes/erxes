import * as dotenv from 'dotenv';
import mongoose = require('mongoose');
import { getEnv } from '../data/utils';
import { debugDb } from '../debuggers';

dotenv.config();

const NODE_ENV = getEnv({ name: 'NODE_ENV' });
const MONGO_URL = getEnv({ name: 'MONGO_URL', defaultValue: '' });

export const connectionOptions: mongoose.ConnectionOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  family: 4,
  useFindAndModify: false,
  useUnifiedTopology: true
};

mongoose.Promise = global.Promise;

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

export const connect = async (URL?: string, options?) => {
  return mongoose.connect(URL || MONGO_URL, {
    ...connectionOptions,
    ...(options || { poolSize: 100 })
  });
};

export function disconnect() {
  return mongoose.connection.close();
}

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