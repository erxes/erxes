/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Customers, Users } from '../db/models';
import { userFactory, customerFactory } from '../db/factories';
import customerMutations from '../data/resolvers/mutations/customers';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Customers mutations', () => {
  let _user;
  let _customer;

  beforeEach(async () => {
    // Creating test data
    _user = await userFactory();
    _customer = await customerFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await Customers.remove({});
    await Users.remove({});
  });

  test('Create customer', async () => {
    // Login required
    expect(() => customerMutations.customersAdd({}, {}, {})).toThrowError('Login required');

    // valid
    const doc = { name: 'name', email: 'dombo@yahoo.com' };

    const customerObj = await customerMutations.customersAdd({}, doc, { user: _user });

    expect(customerObj.name).toBe(doc.name);
    expect(customerObj.email).toBe(doc.email);
  });

  test('Edit customer login required', async () => {
    expect.assertions(1);

    try {
      await customerMutations.customersEdit({}, { _id: _customer.id }, {});
    } catch (e) {
      expect(e.message).toEqual('Login required');
    }
  });

  test('Edit customer valid', async () => {
    const doc = {
      name: 'Dombo',
      email: 'dombo@yahoo.com',
      phone: '242442200',
    };

    const customerObj = await customerMutations.customersEdit(
      {},
      { _id: _customer._id, ...doc },
      { user: _user },
    );

    expect(customerObj.name).toBe(doc.name);
    expect(customerObj.email).toBe(doc.email);
    expect(customerObj.phone).toBe(doc.phone);
  });
});
