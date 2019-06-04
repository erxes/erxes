import * as dotenv from 'dotenv';
import mongoose = require('mongoose');

dotenv.config();

mongoose.Promise = global.Promise;
mongoose.set('useFindAndModify', false);

export const connect = () => {
  const URI = process.env.MONGO_URL;
  mongoose.connect(URI, { useNewUrlParser: true, useCreateIndex: true });

  mongoose.connection
    .on('connected', () => {
      console.log(`Connected to the database: ${URI}`);
    })
    .on('disconnected', () => {
      console.log(`Disconnected from the database: ${URI}`);
    })
    .on('error', error => {
      console.log(`Database connection error: ${URI}`, error);
    });
};
