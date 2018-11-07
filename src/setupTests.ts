import * as dotenv from 'dotenv';
import mongoose = require('mongoose');

mongoose.Promise = global.Promise;

// load environment variables
dotenv.config();

beforeAll(() => {
  const { TEST_MONGO_URL } = process.env;

  return mongoose.connect(
    TEST_MONGO_URL || 'mongodb://localhost/test',
    { useMongoClient: true },
  );
});

afterAll(() => {
  return mongoose.connection.db.dropDatabase();
});
