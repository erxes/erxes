import * as mongoose from 'mongoose';
import { connect } from '../db/connection';

const removeAllCollections = async () => {
  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName];

    await collection.deleteMany({});
  }
};

const dropAllCollections = async () => {
  const collections = Object.keys(mongoose.connection.collections);

  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName];

    try {
      await collection.drop();
    } catch (error) {
      // Sometimes this error happens, but you can safely ignore it
      if (error.message === 'ns not found') {
        return;
      }

      // This error occurs when you use it.todo. You can
      // safely ignore this error too
      if (error.message.includes('a background operation is currently running')) {
        return;
      }

      console.log(error.message);
    }
  }
};

let db;

beforeAll(async done => {
  jest.setTimeout(30000);

  db = await connect(
    (process.env.TEST_MONGO_URL || '').replace(
      'test',
      `erxes-test-${Math.random()
        .toString()
        .replace(/\./g, '')}`,
    ),
    10,
  );

  done();
});

// Cleans up database between each test
afterEach(async () => {
  await removeAllCollections();
});

afterAll(async () => {
  await dropAllCollections();
  await db.connection.dropDatabase();
  return mongoose.connection.close();
});
