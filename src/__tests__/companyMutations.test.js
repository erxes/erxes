/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Companies, Users } from '../db/models';
import { userFactory, companyFactory } from '../db/factories';
import companyMutations from '../data/resolvers/mutations/companies';

beforeAll(() => connect());

afterAll(() => disconnect());

/*
 * Generate test data
 */
const generateData = () => ({
  name: 'New company',
  size: 10,
  industry: 'Mining',
  website: 'https://www.mining.com',
});

/*
 * Check values
 */
const checkValues = (companyObj, doc) => {
  expect(companyObj.name).toBe(doc.name);
  expect(companyObj.size).toBe(doc.size);
  expect(companyObj.industry).toBe(doc.industry);
  expect(companyObj.website).toBe(doc.website);
};

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
    await Companies.remove({});
    await Users.remove({});
  });

  test('Create company', async () => {
    // Login required
    expect(() => companyMutations.companiesAdd({}, {}, {})).toThrowError('Login required');

    // valid
    const data = generateData();

    const companyObj = await companyMutations.companiesAdd({}, data, { user: _user });

    checkValues(companyObj, data);
  });

  test('Edit company login required', async () => {
    expect.assertions(1);

    try {
      await companyMutations.companiesEdit({}, { _id: _company.id }, {});
    } catch (e) {
      expect(e.message).toEqual('Login required');
    }
  });

  test('Edit company valid', async () => {
    const data = generateData();

    const companyObj = await companyMutations.companiesEdit(
      {},
      { _id: _company._id, ...data },
      { user: _user },
    );

    checkValues(companyObj, data);
  });

  test('Remove company login required', async () => {
    expect.assertions(1);

    try {
      await companyMutations.companiesRemove({}, { _id: _company.id }, {});
    } catch (e) {
      expect(e.message).toEqual('Login required');
    }
  });

  test('Remove company valid', async () => {
    const companyDeletedObj = await companyMutations.companiesRemove(
      {},
      { _id: _company.id },
      { user: _user },
    );

    expect(companyDeletedObj.id).toBe(_company.id);

    const companyObj = await Companies.findOne({ _id: _company.id });
    expect(companyObj).toBeNull();
  });
});
