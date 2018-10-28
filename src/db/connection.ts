import * as dotenv from 'dotenv';
import { graphql } from 'graphql';
import mongoose = require('mongoose');
import schema from '../data/';
import { userFactory } from './factories';

dotenv.config();

const { NODE_ENV, MONGO_URL = '' } = process.env;

mongoose.Promise = global.Promise;

mongoose.connection
  .on('connected', () => {
    if (NODE_ENV !== 'test') {
      console.log(`Connected to the database: ${MONGO_URL}`);
    }
  })
  .on('disconnected', () => {
    console.log(`Disconnected from the database: ${MONGO_URL}`);
  })
  .on('error', error => {
    console.log(`Database connection error: ${MONGO_URL}`, error);
  });

export function connect() {
  return mongoose.connect(
    MONGO_URL,
    { useMongoClient: true },
  );
}

export function disconnect() {
  return mongoose.connection.close();
}

export const graphqlRequest = async (mutation: string = '', name: string = '', args?: any, context?: any) => {
  const user = await userFactory({});
  const rootValue = {};
  const _schema: any = schema;
  const response: any = await graphql(_schema, mutation, rootValue, context || { user }, args);

  if (response.errors || !response.data) {
    throw response.errors;
  }

  return response.data[name];
};
