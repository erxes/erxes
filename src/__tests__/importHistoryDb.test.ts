import { connect, disconnect } from '../db/connection';
import { customerFactory, userFactory } from '../db/factories';
import { Customers, ImportHistory, Users } from '../db/models';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Import history model test', () => {
  afterEach(async () => {
    // Clearing test data
    await ImportHistory.remove({});
    await Customers.remove({});
    await Users.remove({});
  });

  test('Create import history', async () => {
    const customer = await customerFactory({});
    const user = await userFactory({});

    const importHistory = await ImportHistory.createHistory(
      {
        success: 0,
        failed: 1,
        total: 4,
        ids: [customer._id],
        contentType: 'customer',
      },
      user,
    );

    if (!importHistory || !importHistory.ids) {
      throw new Error('History not found');
    }

    expect(importHistory.success).toBe(0);
    expect(importHistory.failed).toBe(1);
    expect(importHistory.total).toBe(4);
    expect(importHistory.ids.length).toBe(1);
    expect(importHistory.contentType).toBe('customer');
  });

  test('Remove history', async () => {
    const customer = await customerFactory({});
    const customer1 = await customerFactory({});
    const customer2 = await customerFactory({});
    const user = await userFactory({});

    const importHistory = await ImportHistory.createHistory(
      {
        success: 3,
        failed: 0,
        total: 3,
        ids: [customer._id, customer1._id, customer2._id],
        contentType: 'customer',
      },
      user,
    );

    await ImportHistory.removeHistory(importHistory._id);

    expect(await Customers.findOne({ _id: customer._id })).toBeNull();
    expect(await Customers.findOne({ _id: customer1._id })).toBeNull();
    expect(await Customers.findOne({ _id: customer2._id })).toBeNull();
    expect(await ImportHistory.findOne({ _id: importHistory._id })).toBeNull();
  });
});
