import * as dotenv from 'dotenv';
import mongoose = require('mongoose');

mongoose.Promise = global.Promise;

// load environment variables
dotenv.config();

const TEST_MONGO_URL = process.env.TEST_MONGO_URL || 'mongodb://localhost/test';

// prevent deprecated warning related findAndModify
// https://github.com/Automattic/mongoose/issues/6880
mongoose.set('useFindAndModify', false);

const removeDbs = async () => {
  await mongoose.connect(
    TEST_MONGO_URL.replace('test', `erxes-test-${Math.random()}`).replace(/\./g, ''),
    { useNewUrlParser: true, useCreateIndex: true },
  );

  const result = await mongoose.connection.db.admin().command({
    listDatabases: 1,
    nameOnly: true,
    filter: { name: /^erxes-test/ },
  });

  const promises: any[] = [];

  for (const { name } of result.databases) {
    const db = await mongoose.connect(
      TEST_MONGO_URL.replace('test', name),
      { useNewUrlParser: true, useCreateIndex: true },
    );

    promises.push(db.connection.dropDatabase());
  }

  return Promise.all(promises);
};

removeDbs().then(() => {
  process.exit();
});
