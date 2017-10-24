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
});
