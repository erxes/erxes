import mongoose = require('mongoose');

mongoose.Promise = global.Promise;

beforeAll(() => {
  const DB_URI = `mongodb://localhost/test`;

  return mongoose.connect(
    DB_URI,
    { useMongoClient: true },
  );
});

afterAll(() => {
  return mongoose.connection.db.dropDatabase();
});
