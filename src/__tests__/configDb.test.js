/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Configs } from '../db/models';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Test configs model', () => {
  afterEach(async () => {
    // Clearing test data
    await Configs.remove({});
  });

  test('Create or update config', async () => {
    const code = 'dealCurrency';
    const value = ['MNT', 'USD', 'KRW'];

    const configObj = await Configs.createOrUpdateConfig({
      code,
      value,
    });

    expect(configObj).toBeDefined();
    expect(configObj.code).toEqual(code);
    expect(configObj.value.length).toEqual(value.length);
    expect(configObj.value[0]).toEqual(value[0]);

    const updateConfig = await Configs.createOrUpdateConfig({
      code,
      value: ['update'],
    });

    expect(updateConfig).toBeDefined();
    expect(updateConfig.code).toEqual(code);
    expect(updateConfig.value.length).toEqual(1);
    expect(updateConfig.value[0]).toEqual('update');
  });
});
