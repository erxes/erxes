import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';
import { debugInfo, debugError } from './debuggers';

dotenv.config();

const { MONGO_URL } = process.env;

export const connectionOptions: mongoose.ConnectOptions = {
  family: 4,
};

mongoose.connection
  .on('connected', () => {
    console.log(`Connected to the database: ${MONGO_URL}`);
  })
  .on('disconnected', () => {
    console.log(`Disconnected from the database: ${MONGO_URL}`);

    process.exit(1);
  })
  .on('error', (error) => {
    console.error(`Database connection error: ${MONGO_URL} ${error}`);

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
