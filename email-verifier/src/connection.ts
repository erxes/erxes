import * as dotenv from 'dotenv';
import mongoose = require('mongoose');

dotenv.config();

mongoose.Promise = global.Promise;

const connectionOptions: mongoose.ConnectOptions = {
  family: 4,
};

const { MONGO_URL } = process.env;

mongoose.connection
  .on('connected', () => {})
  .on('disconnected', () => {})
  .on('error', (error) => {
    console.error(error);
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
