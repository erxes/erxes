/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { Users, Channels } from '../db/models';
import usersMutations from '../data/resolvers/mutations/users';
import utils from '../data/utils';

describe('User mutations', () => {
  const user = { _id: 'DFAFDFDFD' };

  test('Login', async () => {
    Users.login = jest.fn();

    const doc = { email: 'test@erxes.io', password: 'password' };

    await usersMutations.login({}, doc);

    expect(Users.login).toBeCalledWith(doc);
  });

  test('Forgot password', async () => {
    Users.forgotPassword = jest.fn();

    const doc = { email: 'test@erxes.io' };

    await usersMutations.forgotPassword({}, doc);

    expect(Users.forgotPassword).toBeCalledWith(doc.email);
  });

  test('Reset password', async () => {
    Users.resetPassword = jest.fn();

    const doc = { token: '2424920429402', newPassword: 'newPassword' };

    await usersMutations.resetPassword({}, doc);

    expect(Users.resetPassword).toBeCalledWith(doc);
  });

  test('Login required checks', async () => {
    const checkLogin = async (fn, args) => {
      try {
        await fn({}, args, {});
      } catch (e) {
        expect(e.message).toEqual('Login required');
      }
    };

    expect.assertions(1);

    // users add
    checkLogin(usersMutations.usersAdd, {});
  });

  test('Users add: wrong password confirmation', async () => {
    expect.assertions(1);

    const doc = {
      password: 'password',
      passwordConfirmation: 'wrong',
    };

    try {
      await usersMutations.usersAdd({}, doc, { user });
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

    await usersMutations.usersAdd(
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
});
