/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import auth from '../auth';
import usersMutations from '../data/resolvers/mutations/users';

describe('User mutations', () => {
  test('Login', async () => {
    auth.login = jest.fn();

    const doc = { email: 'test@erxes.io', password: 'password' };

    await usersMutations.login({}, doc);

    expect(auth.login).toBeCalledWith(doc);
  });

  test('Forgot password', async () => {
    auth.forgotPassword = jest.fn();

    const doc = { email: 'test@erxes.io' };

    await usersMutations.forgotPassword({}, doc);

    expect(auth.forgotPassword).toBeCalledWith(doc);
  });

  test('Reset password', async () => {
    auth.resetPassword = jest.fn();

    const doc = { token: '2424920429402', newPassword: 'newPassword' };

    await usersMutations.resetPassword({}, doc);

    expect(auth.resetPassword).toBeCalledWith(doc);
  });
});
