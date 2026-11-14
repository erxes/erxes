/**
 * Sign-in takes one identifier that may be an email or a username, against
 * real MongoDB: an email always wins, and no member's email may be another
 * member's username.
 */
import { DATABASE } from './usersIdentifierTestEnv';
import mongoose from 'mongoose';
import { generateModels, IModels } from '~/connectionResolvers';

jest.mock('~/modules/notifications/utils', () => ({
  sendOnboardNotification: jest.fn(),
}));

jest.setTimeout(30_000);

const PASSWORD = 'Owner1234';
const OTHER_PASSWORD = 'Member1234';

let models: IModels;

const addUser = async (doc: {
  email: string;
  username: string;
  password: string;
}) =>
  models.Users.create({
    ...doc,
    password: await models.Users.generatePassword(doc.password),
    isActive: true,
  });

beforeAll(async () => {
  models = await generateModels('test');
  await mongoose.connection.asPromise();
}, 60_000);

afterEach(async () => {
  await models.Users.collection.deleteMany({});
});

afterAll(async () => {
  mongoose.connection.removeAllListeners('disconnected');
  await mongoose.disconnect();
  const cleanup = await mongoose
    .createConnection('mongodb://127.0.0.1:27017/admin?directConnection=true')
    .asPromise();
  await cleanup.useDb(DATABASE).dropDatabase();
  await cleanup.useDb(`${DATABASE}_logs`).dropDatabase();
  await cleanup.close();
});

describe('Users.login', () => {
  it("prefers the member whose email it is over another member's username", async () => {
    // Created first, so a single $or lookup would return this one
    await addUser({
      email: 'sales@example.com',
      username: 'info@example.com',
      password: OTHER_PASSWORD,
    });
    const owner = await addUser({
      email: 'info@example.com',
      username: 'admin',
      password: PASSWORD,
    });

    const { user } = await models.Users.login({
      email: 'INFO@example.com',
      password: PASSWORD,
    });

    expect(user._id).toBe(owner._id);
  });

  it('still signs in by username', async () => {
    const member = await addUser({
      email: 'sales@example.com',
      username: 'sales',
      password: OTHER_PASSWORD,
    });

    const { user } = await models.Users.login({
      email: 'sales',
      password: OTHER_PASSWORD,
    });

    expect(user._id).toBe(member._id);
  });
});

describe('Users.checkDuplication', () => {
  it("refuses an email that is another member's username", async () => {
    await addUser({
      email: 'sales@example.com',
      username: 'Info@example.com',
      password: OTHER_PASSWORD,
    });

    await expect(
      models.Users.checkDuplication({ email: 'info@example.com' }),
    ).rejects.toThrow('Duplicated email');
  });

  it("refuses a username that is another member's email", async () => {
    await addUser({
      email: 'info@example.com',
      username: 'admin',
      password: PASSWORD,
    });

    await expect(
      models.Users.checkDuplication({ username: 'INFO@example.com' }),
    ).rejects.toThrow('Username already exists');
  });

  it("lets a member keep their own email as their username", async () => {
    const member = await addUser({
      email: 'info@example.com',
      username: 'info@example.com',
      password: PASSWORD,
    });

    await expect(
      models.Users.checkDuplication({
        username: 'info@example.com',
        idsToExclude: member._id,
      }),
    ).resolves.toBeUndefined();
  });
});
