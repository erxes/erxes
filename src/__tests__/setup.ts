import mongoose = require('mongoose');

mongoose.Promise = global.Promise;

beforeAll((done) => {
  const { TEST_MONGO_URL = '' } = process.env;
  const DB_URI = `${TEST_MONGO_URL}test__${Math.random().toString(36).replace('0.', '')}`;

  mongoose
    .connect(
      DB_URI,
      {
        useMongoClient: true,
      },
    )
    .then(() => {
      console.log('mmmmmm')
      mongoose.connection.db.dropDatabase();
      done();
    })
    .catch((e) => {
      console.log(e);
    });
});

afterAll((done) => {
  mongoose.disconnect().then(() => {
    done();
  });
});