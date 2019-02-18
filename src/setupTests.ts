import * as dotenv from 'dotenv';
import mongoose = require('mongoose');
import { getEnv } from './data/utils';

mongoose.Promise = global.Promise;

// load environment variables
dotenv.config();

const TEST_MONGO_URL = getEnv({ name: 'TEST_MONGO_URL' });

// prevent deprecated warning related findAndModify
// https://github.com/Automattic/mongoose/issues/6880
mongoose.set('useFindAndModify', false);

beforeAll(async () => {
  jest.setTimeout(30000);

  return mongoose.connect(
    TEST_MONGO_URL.replace('test', `erxes-test-${Math.random()}`).replace('.', ''),
    { useNewUrlParser: true, useCreateIndex: true },
  );
});
