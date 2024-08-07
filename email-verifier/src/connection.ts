import * as dotenv from 'dotenv';
import mongoose = require('mongoose');
import { debugBase } from './utils';

dotenv.config();

mongoose.Promise = global.Promise;

const connectionOptions: mongoose.ConnectOptions = {
  family: 4,
};

const { MONGO_URL } = process.env;

mongoose.connection
  .on('connected', () => {
    debugBase(`Connected to the database: ${MONGO_URL}`);
  })
  .on('disconnected', () => {
    debugBase(`Disconnected from the database: ${MONGO_URL}`);
  })
  .on('error', (error) => {
    debugBase(`Database connection error: ${MONGO_URL}`, error);
  });

export const connect = async (URL?: string, options?) => {
  return mongoose.connect(URL || MONGO_URL, {
    ...connectionOptions,
    ...(options || { poolSize: 100 }),
  });
};

export function disconnect() {
  return mongoose.connection.close();
}
