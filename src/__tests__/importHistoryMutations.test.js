/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect, graphqlRequest } from '../db/connection';
import { ImportHistory, Users, Customers } from '../db/models';
import { importHistoryFactory, userFactory, customerFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Import history mutations', () => {
  let _user;
  let context;

  beforeEach(async () => {
    // Creating test data
    _user = await userFactory();

    context = { user: _user };
  });

  afterEach(async () => {
    // Clearing test data
    await ImportHistory.remove({});
    await Users.remove({});
  });

  test('Remove import histories', async () => {
    const mutation = `
      mutation importHistoriesRemove($_id: String!) {
        importHistoriesRemove(_id: $_id)
      }
    `;
    const customer = customerFactory({});

    const importHistory = await importHistoryFactory({
      ids: [customer._id],
    });

    await graphqlRequest(mutation, 'importHistoriesRemove', { _id: importHistory._id }, context);

    expect(await ImportHistory.findOne({ _id: importHistory._id })).toBeNull();
    expect(await Customers.findOne({ _id: customer._id })).toBeNull();
  });
});
