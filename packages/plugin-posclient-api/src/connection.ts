import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import { debugDb } from './debugger';

dotenv.config();

const { NODE_ENV, MONGO_URL = '' } = process.env;

export let client;

export const connectionOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  autoReconnect: true,
  useFindAndModify: false
};

(mongoose.Promise as any) = global.Promise;

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
    debugDb(`Database connection error: ${MONGO_URL}`, error);
  });

const connect = async (URL?: string, options?) => {
  debugDb(`Trying to connect to ... : ${MONGO_URL}`);

  client = await mongoose.connect(URL || MONGO_URL, {
    ...connectionOptions,
    ...(options || { poolSize: 100 })
  });
};

export function disconnect() {
  return mongoose.connection.close();
}

export const init = async () => {
  if (!client || (client && !client.isConnected())) {
    client = await connect();
  }
};

init();

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
