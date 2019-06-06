import { connect } from '../db/connection';

let db;

beforeAll(async done => {
  jest.setTimeout(30000);

  db = await connect(
    `erxes-test-${Math.random()
      .toString()
      .replace(/\./g, '')}`,
    3,
  );

  done();
});

afterAll(() => {
  return db.connection.dropDatabase();
});
