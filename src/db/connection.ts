import * as dotenv from 'dotenv';
import { graphql } from 'graphql';
import mongoose = require('mongoose');
import * as request from 'request';
import schema from '../data/';
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
    { useNewUrlParser: true },
  );
}

export function disconnect() {
  return mongoose.connection.close();
}

export const graphqlRequest = async (mutation: string = '', name: string = '', args?: any, context?: any) => {
  const user = await userFactory({});
  const rootValue = {};
  const _schema: any = schema;

  const res = {
    cookie: () => {
      return 'cookie';
    },
  };

  const response: any = await graphql(_schema, mutation, rootValue, context || { user, res }, args);

  if (response.errors || !response.data) {
    throw response.errors;
  }

  return response.data[name];
};

export const sendPostRequest = (url: string, params: { [key: string]: string }) =>
  new Promise((resolve, reject) =>
    request.post(url, { form: params }, (error, response, body) => {
      if (error) {
        reject(error);
      }

      resolve({
        body,
        contentLength: response.headers['content-length'],
        contentType: response.headers['content-type'],
      });
    }),
  );
