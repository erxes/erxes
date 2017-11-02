/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { Users } from '../db/models';
import usersMutations from '../data/resolvers/mutations/users';

describe('User mutations', () => {
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
});
