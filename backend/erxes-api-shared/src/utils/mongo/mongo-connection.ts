import mongoose from 'mongoose';
import { cleanupChangeStreams } from './change-stream';

const { MONGO_URL = 'mongodb://127.0.0.1:27017/erxes?directConnection=true' } =
  process.env;

export const mongooseConnectionOptions: mongoose.ConnectOptions = {
  family: 4,
};

mongoose.connection
  .on('connected', () => {
    console.log(`Connected to the database: ${MONGO_URL}`);
  })
  .on('disconnected', (...props) => {
    cleanupChangeStreams();

    console.log(`Disconnected from the database: ${MONGO_URL}`);

    process.exit(1);
  })
  .on('error', (error) => {
    cleanupChangeStreams();

    console.error(`Database connection error: ${MONGO_URL} ${error}`);

    process.exit(1);
  })
  .on('close', () => {
    cleanupChangeStreams();
  });

export async function connect(): Promise<mongoose.Connection> {
  if (!MONGO_URL) {
    throw new Error('MONGO_URL is not defined');
  }

  await mongoose.connect(MONGO_URL, mongooseConnectionOptions);
  return mongoose.connection;
}

export async function closeMongooose() {
  try {
    await mongoose.connection.close();
    console.log('Mongoose connection disconnected ');
  } catch (e) {
    console.error(e);
  }
}
