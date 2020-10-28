import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import { connectionOptions } from '../db/connection';
import { initMemoryStorage } from '../inmemoryStorage';
import { initBroker } from '../messageBroker';

// May require additional time for downloading MongoDB binaries
jasmine.DEFAULT_TIMEOUT_INTERVAL = 600000;

let mongoServer;

beforeAll(async () => {
  mongoServer = new MongoMemoryServer();

  await initBroker();

  initMemoryStorage();

  const mongoUri = await mongoServer.getConnectionString();

  await mongoose.connect(mongoUri, {
    ...connectionOptions,
    useUnifiedTopology: true
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();

  if (global.gc) {
    global.gc();
  }
});
