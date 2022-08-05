import { importHistoryFactory, userFactory } from '../db/factories';
import { Customers, ImportHistory, Users } from '../db/models';

import './setup.ts';

describe('Import history model test', () => {
  afterEach(async () => {
    // Clearing test data
    await ImportHistory.deleteMany({});
    await Customers.deleteMany({});
    await Users.deleteMany({});
  });

  test('Get customer', async () => {
    const importHistory = await importHistoryFactory({});

    try {
      await ImportHistory.getImportHistory('fakeId');
    } catch (e) {
      expect(e.message).toBe('Import history not found');
    }

    const response = await ImportHistory.getImportHistory(importHistory._id);

    expect(response).toBeDefined();
  });

  test('Create import history', async () => {
    const user = await userFactory({});

    const importHistory = await ImportHistory.createHistory(
      {
        success: 0,
        failed: 1,
        updated: 0,
        total: 4,
        attachments: [],
        name: 'test',
        contentTypes: ['customer']
      },
      user
    );

    expect(importHistory.success).toBe(0);
    expect(importHistory.failed).toBe(1);
    expect(importHistory.total).toBe(4);
    expect(importHistory.contentTypes).toBeDefined();
  });

  test('Remove history', async () => {
    expect.assertions(2);

    const user = await userFactory({});

    const importHistory = await ImportHistory.createHistory(
      {
        success: 3,
        failed: 0,
        total: 3,
        contentTypes: ['customer'],
        updated: 0,
        attachments: [],
        name: 'test'
      },
      user
    );

    await ImportHistory.removeHistory(importHistory._id);

    expect(await ImportHistory.findOne({ _id: importHistory._id })).toBeNull();

    try {
      await ImportHistory.removeHistory('fakeId');
    } catch (e) {
      expect(e.message).toBe('Import history not found');
    }
  });
});
