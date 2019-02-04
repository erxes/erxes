import * as dotenv from 'dotenv';
import { graphql } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';
import mongoose = require('mongoose');
import resolvers from '../data/resolvers';
import typeDefs from '../data/schema';
import { userFactory } from './factories';

dotenv.config();

const { NODE_ENV, MONGO_URL = '' } = process.env;

mongoose.set('useFindAndModify', false);

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
    { useNewUrlParser: true, useCreateIndex: true, poolSize: 10 },
  );
}

export function disconnect() {
  return mongoose.connection.close();
}

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

export const graphqlRequest = async (source: string = '', name: string = '', args?: any, context?: any) => {
  const user = await userFactory({});

  const rootValue = {};

  const res = {
    cookie: () => {
      return 'cookie';
    },
  };

  const response: any = await graphql(schema, source, rootValue, context || { user, res }, args);

  if (response.errors || !response.data) {
    throw response.errors;
  }

  return response.data[name];
};
