import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';
import { debugInfo, debugError } from './debuggers';
import { getEnv } from './utils';

dotenv.config();

// mongoose.Promise = global.Promise;

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
    debugInfo(`Connected to the database: ${MONGO_URL}`);
  })
  .on('disconnected', () => {
    debugInfo(`Disconnected from the database: ${MONGO_URL}`);

    process.exit(1);
  })
  .on('error', error => {
    debugError(`Database connection error: ${MONGO_URL} ${error}`);

    process.exit(1);
  });

export const connect = (URL?: string) => {
  return mongoose.connect(URL || MONGO_URL, connectionOptions);
};

export function disconnect() {
  return mongoose.connection.close();
}
