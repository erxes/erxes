import * as dotenv from 'dotenv';
import mongoose = require('mongoose');

mongoose.Promise = global.Promise;

// load environment variables
dotenv.config();

beforeAll(() => {
  jest.setTimeout(10000);

  const { TEST_MONGO_URL } = process.env;

  return mongoose.connect(
    TEST_MONGO_URL || 'mongodb://localhost/test',
    { useNewUrlParser: true, useCreateIndex: true },
  );
});

afterAll(() => {
  return mongoose.connection.db.dropDatabase();
});
