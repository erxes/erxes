import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

const { MONGO_URL } = process.env;

if(!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

export const connectionOptions: mongoose.ConnectionOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  // autoReconnect: true,
  family: 4,
  useFindAndModify: false
};

export const connect = (URL?: string) => {
  return mongoose.connect(URL || MONGO_URL, connectionOptions);
};

export function disconnect() {
  return mongoose.connection.close();
}