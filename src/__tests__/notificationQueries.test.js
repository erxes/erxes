/* eslint-env jest */
/* eslint-disable no-underscore-dangle */
import { connect, disconnect } from '../db/connection';
import { MODULE_LIST } from '../data/constants';
import queries from '../data/resolvers/queries';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('notification query test', () => {
  test('test of getting notification list with success', () => {
    const modules = queries.notificationsModules();

    expect(modules).toEqual(MODULE_LIST);
  });
});
