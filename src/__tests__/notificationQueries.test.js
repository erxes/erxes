/* eslint-env jest */
/* eslint-disable no-underscore-dangle */
import { connect, disconnect } from '../db/connection';
import { NOTIFICATION_MODULES } from '../data/constants';
import notificationsQueries from '../data/resolvers/queries/notifications';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('notificationsQueries', () => {
  test(`test if Error('Login required') exception is working as intended`, async () => {
    expect.assertions(4);

    const expectError = async func => {
      try {
        await func(null, {}, {});
      } catch (e) {
        expect(e.message).toBe('Login required');
      }
    };

    expectError(notificationsQueries.notifications);
    expectError(notificationsQueries.notificationsCount);
    expectError(notificationsQueries.notificationsModules);
    expectError(notificationsQueries.notificationsGetConfigurations);
  });

  test('test of getting notification list with success', () => {
    const modules = notificationsQueries.notificationsModules(null, null, {
      user: { _id: 'fakeUserId' },
    });
    expect(modules).toBe(NOTIFICATION_MODULES);
  });
});
