import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';

dotenv.config();

let db;

const getCollections = () => {
  return Object.keys(db.connection.collections);
};

const getCollectionByName = collectionName => {
  return db.connection.collections[collectionName];
};

beforeAll(async done => {
  db = await mongoose.connect(process.env.TEST_MONGO_URL);
  done();
});

afterEach(async () => {
  for (const collectionName of getCollections()) {
    await getCollectionByName(collectionName).deleteMany({});
  }
});

afterAll(async () => {
  for (const collectionName of getCollections()) {
    try {
      await getCollectionByName(collectionName).drop();
    } catch (error) {
      if (error.message === 'ns not found') {
        return;
      }
    }
  }

  db.connection.removeAllListeners('open');

  db.connection.db.dropDatabase();

  db.connection.close();
});
