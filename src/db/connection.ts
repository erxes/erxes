import * as dotenv from 'dotenv';
import { graphql } from 'graphql';
import mongoose = require('mongoose');
import schema from '../data/';
import { userFactory } from './factories';

dotenv.config();

const { NODE_ENV, TEST_MONGO_URL = '', MONGO_URL = '' } = process.env;
const isTest = NODE_ENV === 'test';
const DB_URI = (isTest ? TEST_MONGO_URL : MONGO_URL) || '';

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
    .connect(
      DB_URI,
      {
        useMongoClient: true,
      },
    )
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

export const graphqlRequest = async (mutation: string = '', name: string = '', args?: any, context?: any) => {
  const user = await userFactory({});
  const rootValue = {};
  const response: any = await graphql(schema, mutation, rootValue, context || { user }, args);

  if (response.errors || !response.data) {
    throw response.errors;
  }

  return response.data[name];
};
