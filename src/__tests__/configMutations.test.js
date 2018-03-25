/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Configs } from '../db/models';
import configsMutations from '../data/resolvers/mutations/configs';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Test configs mutations', () => {
  afterEach(async () => {
    // Clearing test data
    await Configs.remove({});
  });

  test('Check login required', async () => {
    expect.assertions(1);

    const check = async fn => {
      try {
        await fn({}, {}, {});
      } catch (e) {
        expect(e.message).toEqual('Login required');
      }
    };

    // insert
    check(configsMutations.configsInsert);
  });

  test('Insert config', async () => {
    const doc = { code: 'dealUOM', value: [] };

    Configs.createOrUpdateConfig = jest.fn();

    await configsMutations.configsInsert({}, doc, { user: { _id: 'userId' } });

    expect(Configs.createOrUpdateConfig).toBeCalledWith(doc);
    expect(Configs.createOrUpdateConfig.mock.calls.length).toBe(1);
  });
});
