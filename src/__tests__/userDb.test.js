/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Users } from '../db/models';
import { userFactory } from '../db/factories';
import bcrypt from 'bcrypt';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('User db utils', () => {
  let _user;

  beforeEach(async () => {
    // Creating test data
    _user = await userFactory({ email: 'info@erxes.io', isOwner: true });
  });

  afterEach(async () => {
    // Clearing test data
    await Users.remove({});
  });

  test('Create user', async () => {
    const testPassword = 'test';

    const userObj = await Users.createUser({
      ..._user._doc,
      details: _user._doc.details,
      password: testPassword,
    });

    expect(userObj).toBeDefined();
    expect(userObj.username).toBe(_user.username);
    expect(userObj.email).toBe(_user.email);
    expect(userObj.role).toBe(_user.role);
    expect(bcrypt.compare(testPassword, userObj.password)).toBeTruthy();
    expect(userObj.details.position).toBe(_user.details.position);
    expect(userObj.details.twitterUsername).toBe(_user.details.twitterUsername);
    expect(userObj.details.fullName).toBe(_user.details.fullName);
    expect(userObj.details.avatar).toBe(_user.details.avatar);
  });

  test('Update user: owner required', async () => {
    const user = await userFactory();

    expect.assertions(1);

    try {
      await Users.updateUser(user._id, {});
    } catch (e) {
      expect(e.message).toBe('Permission denied');
    }
  });

  test('Update user', async () => {
    const updateDoc = await userFactory();

    const testPassword = 'updatedPass';

    // try using exisiting one
    await Users.updateUser(_user._id, {
      email: updateDoc.email,
      username: updateDoc.username,
      password: testPassword,
      details: updateDoc._doc.details,
    });

    const userObj = await Users.findOne({ _id: _user._id });

    expect(userObj.username).toBe(updateDoc.username);
    expect(userObj.email).toBe(updateDoc.email);
    expect(userObj.role).toBe(userObj.role);
    expect(bcrypt.compare(testPassword, userObj.password)).toBeTruthy();
    expect(userObj.details.position).toBe(updateDoc.details.position);
    expect(userObj.details.twitterUsername).toBe(updateDoc.details.twitterUsername);
    expect(userObj.details.fullName).toBe(updateDoc.details.fullName);
    expect(userObj.details.avatar).toBe(updateDoc.details.avatar);
  });
});
