import { connect } from '../connection';

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
  );

  done();
});

afterAll(() => {
  return db.connection.dropDatabase();
});
