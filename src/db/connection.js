/* eslint-disable no-console */

import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const { NODE_ENV, TEST_MONGO_URL, MONGO_URL } = process.env;
const isTest = NODE_ENV == 'test';
const DB_URI = isTest ? TEST_MONGO_URL : MONGO_URL;

mongoose.Promise = global.Promise;

if (!isTest) {
  mongoose.connection
    .on('connected', () => {
      console.log(`Connected to the database: ${DB_URI}`);
    })
    .on('disconnected', () => {
      console.log(`Disconnected from the database: ${DB_URI}`);
    })
    .on('error', error => {
      console.log(`Database connection error: ${DB_URI}`, error);
    });
}

export function connect() {
  return mongoose
    .connect(DB_URI, {
      useMongoClient: true,
    })
    .then(() => {
      // empty (drop) database before running tests
      if (isTest) {
        return mongoose.connection.db.dropDatabase();
      }
    });
}

export function disconnect() {
  return mongoose.connection.close();
}
