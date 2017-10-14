/* eslint-env jest */
/* eslint-disable no-underscore-dangle */
import { connect, disconnect } from '../db/connection';
import { MODULES } from '../data/constants';
import notificationsQueries from '../data/resolvers/queries/notifications';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('notification query test', () => {
  test('test of getting notification list with success', () => {
    const modules = notificationsQueries.notificationsModules();
    expect(modules).toBe(MODULES.ALL);
  });
});
