import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';
import { debugInfo, debugError } from './debuggers';

dotenv.config();

const { MONGO_URL } = process.env;

export const connectionOptions: mongoose.ConnectionOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  // autoReconnect: true,
  family: 4,
  useFindAndModify: false,
};

mongoose.connection
  .on('connected', () => {
    debugInfo(`Connected to the database: ${MONGO_URL}`);
  })
  .on('disconnected', () => {
    debugInfo(`Disconnected from the database: ${MONGO_URL}`);

    process.exit(1);
  })
  .on('error', (error) => {
    debugError(`Database connection error: ${MONGO_URL} ${error}`);

    process.exit(1);
  });

export async function connect(): Promise<mongoose.Connection> {
  if (!MONGO_URL) {
    throw new Error('MONGO_URL is not defined');
  }
  await mongoose.connect(MONGO_URL, connectionOptions);
  return mongoose.connection;
}

export async function disconnect(): Promise<void> {
  return mongoose.connection.close();
}
