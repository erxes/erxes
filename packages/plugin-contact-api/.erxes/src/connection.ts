import * as dotenv from 'dotenv';
import mongoose = require('mongoose');
import { debugDb } from './debuggers';
import { getEnv } from '../../src/utils';

dotenv.config();

mongoose.Promise = global.Promise;

const MONGO_URL = getEnv({ name: 'MONGO_URL' });

export const connectionOptions: mongoose.ConnectionOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  // autoReconnect: true,
  family: 4,
  useFindAndModify: false
};

mongoose.connection
  .on('connected', () => {
    debugDb(`Connected to the database: ${MONGO_URL}`);
  })
  .on('disconnected', () => {
    debugDb(`Disconnected from the database: ${MONGO_URL}`);
  })
  .on('error', error => {
    debugDb(`Database connection error: ${MONGO_URL} ${error}`);
  });

export const connect = (URL?: string) => {
  return mongoose.connect(URL || MONGO_URL, connectionOptions);
};

export function disconnect() {
  return mongoose.connection.close();
}
