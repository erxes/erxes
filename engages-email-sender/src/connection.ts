import * as dotenv from 'dotenv';
import mongoose = require('mongoose');
import { debugDb } from './debuggers';
import { getEnv } from './utils';

dotenv.config();

mongoose.Promise = global.Promise;
mongoose.set('useFindAndModify', false);
const MONGO_URL = getEnv({ name: 'MONGO_URL' });

mongoose.connection
  .on('connected', () => {
    debugDb(`Connected to the database: ${MONGO_URL}`);
  })
  .on('disconnected', () => {
    debugDb(`Disconnected from the database: ${MONGO_URL}`);
  })
  .on('error', error => {
    debugDb(`Database connection error: ${MONGO_URL}`, error);
  });

export const connect = (URL?: string) => {
  return mongoose.connect(URL || MONGO_URL, { useNewUrlParser: true, useCreateIndex: true });
};

export function disconnect() {
  return mongoose.connection.close();
}
