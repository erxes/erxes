import * as dotenv from 'dotenv';
import mongoose = require('mongoose');
import { debugDb } from './debuggers';

dotenv.config();

mongoose.Promise = global.Promise;

export const connectionOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  autoReconnect: true,
  useFindAndModify: false
};

export const connect = () => {
  const URI = process.env.MONGO_URL;
  mongoose.connect(URI, connectionOptions);

  mongoose.connection
    .on('connected', () => {
      debugDb(`Connected to the database: ${URI}`);
    })
    .on('disconnected', () => {
      debugDb(`Disconnected from the database: ${URI}`);
    })
    .on('error', error => {
      debugDb(`Database connection error: ${URI} ${error}`);
    });
};
