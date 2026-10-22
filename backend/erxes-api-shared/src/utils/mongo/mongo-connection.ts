import mongoose from 'mongoose';
import { logger } from '../logger';

const { MONGO_URL = 'mongodb://127.0.0.1:27017/erxes?directConnection=true' } =
  process.env;

export const mongooseConnectionOptions: mongoose.ConnectOptions = {
  family: 4,
};

// MONGO_URL carries the database password: logged through the logger, which masks it
mongoose.connection
  .on('connected', () => {
    logger.info({ url: MONGO_URL }, 'connected to the database');
  })
  .on('disconnected', () => {
    logger.error({ url: MONGO_URL }, 'disconnected from the database');

    process.exit(1);
  })
  .on('error', (error) => {
    logger.error({ url: MONGO_URL, err: error }, 'database connection error');

    process.exit(1);
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
