/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Users, Channels } from '../db/models';
import { userFactory, channelFactory } from '../db/factories';
import userMutations from '../data/resolvers/mutations/users';
import utils from '../data/utils';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('User mutations', () => {
  const user = { _id: 'DFAFDFDFD' };

  afterEach(async () => {
    // Clearing test data
    await Users.remove({});
    await Channels.remove({});
  });

  test('Login', async () => {
    Users.login = jest.fn();

    const doc = { email: 'test@erxes.io', password: 'password' };

    await userMutations.login({}, doc);

    expect(Users.login).toBeCalledWith(doc);
  });

  test('Forgot password', async () => {
    Users.forgotPassword = jest.fn();

    const doc = { email: 'test@erxes.io' };

    await userMutations.forgotPassword({}, doc);

    expect(Users.forgotPassword).toBeCalledWith(doc.email);
  });

  test('Reset password', async () => {
    Users.resetPassword = jest.fn();

    const doc = { token: '2424920429402', newPassword: 'newPassword' };

    await userMutations.resetPassword({}, doc);

    expect(Users.resetPassword).toBeCalledWith(doc);
  });

  test('Change password', async () => {
    Users.changePassword = jest.fn();

    const doc = {
      currentPassword: 'currentPassword',
      newPassword: 'newPassword',
    };

    const user = { _id: 'DFAFASD' };

    await userMutations.usersChangePassword({}, doc, { user });

    expect(Users.changePassword).toBeCalledWith({ _id: user._id, ...doc });
  });

  test('Login required checks', async () => {
    const checkLogin = async (fn, args) => {
      try {
        await fn({}, args, {});
      } catch (e) {
        expect(e.message).toEqual('Login required');
      }
    };

    expect.assertions(5);

    // users change password
    checkLogin(userMutations.usersChangePassword, {});

    // users add
    checkLogin(userMutations.usersAdd, {});

    // users edit
    checkLogin(userMutations.usersEdit, {});

    // users edit profile
    checkLogin(userMutations.usersEditProfile, {});

    // users remove
    checkLogin(userMutations.usersRemove, {});
  });

  test('Users add & edit: wrong password confirmation', async () => {
    expect.assertions(2);

    const doc = {
      password: 'password',
      passwordConfirmation: 'wrong',
    };

    try {
      await userMutations.usersAdd({}, doc, { user });
    } catch (e) {
      expect(e.message).toBe('Incorrect password confirmation');
    }

    try {
      await userMutations.usersEdit({}, doc, { user });
    } catch (e) {
      expect(e.message).toBe('Incorrect password confirmation');
    }
  });

  test('Users add', async () => {
    const user = { _id: 'DFAFDFDFD' };
    const channelIds = ['DFAFSDFDSAF', 'DFFADSFDSFD'];

    Users.createUser = jest.fn(() => ({ _id: '_id' }));
    Channels.updateUserChannels = jest.fn();
    const spyEmail = jest.spyOn(utils, 'sendEmail');

    const doc = {
      username: 'username',
      password: 'password',
      email: 'info@erxes.io',
      role: 'admin',
      details: {},
    };

    await userMutations.usersAdd(
      {},
      { ...doc, passwordConfirmation: 'password', channelIds },
      { user },
    );

    // create user call
    expect(Users.createUser).toBeCalledWith(doc);

    // update user channels call
    expect(Channels.updateUserChannels).toBeCalledWith(channelIds, '_id');

    // send email call
    expect(spyEmail).toBeCalledWith({
      toEmails: [doc.email],
      fromEmail: process.env.COMPANY_EMAIL_FROM,
      subject: 'Invitation info',
      template: {
        name: 'invitation',
        data: {
          username: doc.username,
          password: doc.password,
        },
      },
    });
  });

  test('Users edit', async () => {
    const creatingUser = { _id: 'DFAFDFDFD' };
    const channelIds = ['DFAFSDFDSAF', 'DFFADSFDSFD'];

    Users.updateUser = jest.fn();
    Channels.updateUserChannels = jest.fn();

    const userId = 'DFAFDSFSDFDSF';
    const doc = {
      username: 'username',
      password: 'password',
      email: 'info@erxes.io',
      role: 'admin',
      details: {},
    };

    await userMutations.usersEdit(
      {},
      { ...doc, _id: userId, passwordConfirmation: 'password', channelIds },
      { user: creatingUser },
    );

    // update user call
    expect(Users.updateUser).toBeCalledWith(userId, doc);

    // update user channels call
    expect(Channels.updateUserChannels).toBeCalledWith(channelIds, userId);
  });

  test('Users edit profile: invalid password', async () => {
    expect.assertions(1);

    const user = await userFactory({ password: 'p' });

    try {
      await userMutations.usersEditProfile({}, { password: 'password' }, { user });
    } catch (e) {
      expect(e.message).toBe('Invalid password');
    }
  });

  test('Users edit profile: successfull', async () => {
    const user = await userFactory({});

    Users.editProfile = jest.fn();

    const doc = {
      username: 'username',
      email: 'info@erxes.io',
      details: {
        fullName: 'fullName',
        twitterUsername: 'twitterUsername',
        position: 'position',
      },
    };

    await userMutations.usersEditProfile({}, { ...doc, password: 'Dombo@123' }, { user });

    expect(Users.editProfile).toBeCalledWith(user._id, doc);
  });

  test('Users remove: can not delete owner', async () => {
    expect.assertions(1);

    const owner = await userFactory({ isOwner: true });

    try {
      await userMutations.usersRemove({}, { _id: owner._id }, { user });
    } catch (e) {
      expect(e.message).toBe('Can not remove owner');
    }
  });

  test('Users remove: can not remove user who created some channels', async () => {
    expect.assertions(1);

    const userToRemove = await userFactory({});
    await channelFactory({ userId: userToRemove._id });

    try {
      await userMutations.usersRemove({}, { _id: userToRemove._id }, { user });
    } catch (e) {
      expect(e.message).toBe('You cannot delete this user. This user belongs other channel.');
    }
  });

  test('Users remove: can not remove user who involved some channels', async () => {
    expect.assertions(1);

    const userToRemove = await userFactory({});
    await channelFactory({ memberIds: ['DFAFSFDSFDS', userToRemove._id] });

    try {
      await userMutations.usersRemove({}, { _id: userToRemove._id }, { user });
    } catch (e) {
      expect(e.message).toBe('You cannot delete this user. This user belongs other channel.');
    }
  });

  test('Users remove: successful', async () => {
    const removeUser = await userFactory({});
    const removeUserId = removeUser._id;

    await userMutations.usersRemove({}, { _id: removeUserId }, { user });

    // ensure removed
    expect(await Users.findOne({ _id: removeUserId })).toBe(null);
  });
});
