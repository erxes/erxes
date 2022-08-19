// import { gql } from 'apollo-server-express';
import * as dotenv from 'dotenv';
// import { graphql } from 'graphql';
// import { makeExecutableSchema } from 'graphql-tools';
import mongoose = require('mongoose');
// import resolvers from '../data/resolvers';
// import { mutations, queries, subscriptions, types } from '../data/schema';

// import { userFactory } from './factories';
// import { generateAllDataLoaders } from '../data/dataLoaders';

dotenv.config();

const { NODE_ENV, MONGO_URL = 'mongodb://localhost/erxes' } = process.env;

export const connectionOptions: mongoose.ConnectionOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  family: 4,
  useFindAndModify: false,
  useUnifiedTopology: true
};

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
    console.log(`Database connection error: ${MONGO_URL} ${error}`);
  });

export const connect = async (URL?: string, options?) => {
  return mongoose.connect(URL || MONGO_URL, {
    ...connectionOptions,
    ...(options || { poolSize: 100 })
  });
};

export function disconnect() {
  return mongoose.connection.close();
}

/**
 * Health check status
 */
export const mongoStatus = () => {
  return new Promise((resolve, reject) => {
    mongoose.connection.db.admin().ping((err, result) => {
      if (err) {
        return reject(err);
      }

      return resolve(result);
    });
  });
};
