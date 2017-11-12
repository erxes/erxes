/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Companies, Users } from '../db/models';
import { userFactory, companyFactory } from '../db/factories';
import companyMutations from '../data/resolvers/mutations/companies';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Companies mutations', () => {
  let _user;
  let _company;

  beforeEach(async () => {
    // Creating test data
    _user = await userFactory();
    _company = await companyFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await Users.remove({});
    await Companies.remove({});
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
    check(companyMutations.companiesAdd);

    // edit
    check(companyMutations.companiesEdit);

    // add company
    check(companyMutations.companiesAddCustomer);
  });

  test('Create company', async () => {
    Companies.createCompany = jest.fn(() => ({
      name: 'test company name',
      _id: 'test company id',
    }));

    const doc = { name: 'name', email: 'dombo@yahoo.com' };

    await companyMutations.companiesAdd({}, doc, { user: _user });

    expect(Companies.createCompany).toBeCalledWith(doc);
  });

  test('Edit company valid', async () => {
    const doc = {
      name: 'Dombo',
      email: 'dombo@yahoo.com',
      phone: '242442200',
    };

    Companies.updateCompany = jest.fn();

    await companyMutations.companiesEdit({}, { _id: _company._id, ...doc }, { user: _user });

    expect(Companies.updateCompany).toBeCalledWith(_company._id, doc);
  });

  test('Add customer', async () => {
    Companies.addCustomer = jest.fn(() => ({
      name: 'test customer name',
      _id: 'test customer id',
    }));

    const doc = { name: 'name', email: 'name@gmail.com' };

    await companyMutations.companiesAddCustomer({}, doc, { user: _user });

    expect(Companies.addCustomer).toBeCalledWith(doc);
  });
});
