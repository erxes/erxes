import * as dotenv from 'dotenv';
import mongoose = require('mongoose');

dotenv.config();

mongoose.Promise = global.Promise;
mongoose.set('useFindAndModify', false);

const connect = (MONGO_URL?: string) => {
  const URI = MONGO_URL || process.env.API_MONGO_URL;
  const connection = mongoose.createConnection(URI, { useNewUrlParser: true, useCreateIndex: true });

  connection
    .on('connected', () => {
      console.log(`Connected to the database: ${URI}`);
    })
    .on('disconnected', () => {
      console.log(`Disconnected from the database: ${URI}`);
    })
    .on('error', error => {
      console.log(`Database connection error: ${URI}`, error);
    });

  return connection;
};

export const integrationsConnection = connect(process.env.MONGO_URL);
export const apiConnection = connect();

export function disconnect(connection) {
  return connection.close();
}
