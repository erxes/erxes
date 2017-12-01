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
    await Users.remove({});
    await Customers.remove({});
  });

  test('Check login required', async () => {
    expect.assertions(3);

    const check = async fn => {
      try {
        await fn({}, {}, {});
      } catch (e) {
        expect(e.message).toEqual('Login required');
      }
    };

    // add
    check(customerMutations.customersAdd);

    // edit
    check(customerMutations.customersEdit);

    // add company
    check(customerMutations.customersAddCompany);
  });

  test('Create customer', async () => {
    Customers.createCustomer = jest.fn(() => {
      return {
        name: 'name',
        _id: 'fakeCustomerId',
      };
    });

    const doc = { name: 'name', email: 'dombo@yahoo.com' };

    await customerMutations.customersAdd({}, doc, { user: _user });

    expect(Customers.createCustomer).toBeCalledWith(doc);
  });

  test('Edit customer valid', async () => {
    const doc = {
      name: 'Dombo',
      email: 'dombo@yahoo.com',
      phone: '242442200',
    };

    Customers.updateCustomer = jest.fn();

    await customerMutations.customersEdit({}, { _id: _customer._id, ...doc }, { user: _user });

    expect(Customers.updateCustomer).toBeCalledWith(_customer._id, doc);
  });

  test('Add company', async () => {
    Customers.addCompany = jest.fn(() => {
      return {
        name: 'name',
        _id: 'fakeCustomerId',
      };
    });

    const doc = { name: 'name', website: 'http://company.com' };

    await customerMutations.customersAddCompany({}, doc, { user: _user });

    expect(Customers.addCompany).toBeCalledWith(doc);
  });
});
