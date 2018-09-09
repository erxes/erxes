import * as faker from 'faker';
import { connect, disconnect, graphqlRequest } from '../db/connection';
import { companyFactory, customerFactory, userFactory } from '../db/factories';
import { Companies, Customers, Users } from '../db/models';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Companies mutations', () => {
  let _company;
  let _customer;
  let _user;
  let context;

  const commonParamDefs = `
    $primaryName: String
    $names: [String]
    $size: Int
    $website: String
    $industry: String
    $tagIds: [String]
    $customFieldsData: JSON
  `;

  const commonParams = `
    primaryName: $primaryName
    names: $names
    size: $size
    website: $website
    industry: $industry
    tagIds: $tagIds
    customFieldsData: $customFieldsData
  `;

  beforeEach(async () => {
    // Creating test data
    _company = await companyFactory({});
    _customer = await customerFactory({});
    _user = await userFactory({ role: 'admin' });

    context = { user: _user };
  });

  afterEach(async () => {
    // Clearing test data
    await Companies.remove({});
    await Customers.remove({});
    await Users.remove({});
  });

  test('Add company', async () => {
    const args = {
      primaryName: faker.company.companyName(),
      names: [faker.company.companyName()],
      size: faker.random.number(),
      website: faker.internet.url(),
      industry: 'Airlines',
      tagIds: _company.tagIds,
      customFieldsData: {},
    };

    const mutation = `
      mutation companiesAdd(${commonParamDefs}) {
        companiesAdd(${commonParams}) {
          primaryName
          names
          size
          website
          industry
          tagIds
          customFieldsData
        }
      }
    `;

    const company = await graphqlRequest(mutation, 'companiesAdd', args, context);

    expect(company.primaryName).toBe(args.primaryName);
    expect(company.names).toEqual(expect.arrayContaining(args.names));
    expect(company.size).toBe(args.size);
    expect(company.website).toBe(args.website);
    expect(company.industry).toBe(args.industry);
    expect(expect.arrayContaining(company.tagIds)).toEqual(args.tagIds);
    expect(company.customFieldsData).toEqual(args.customFieldsData);
  });

  test('Edit company', async () => {
    const args = {
      _id: _company._id,
      primaryName: faker.company.companyName(),
      names: [faker.company.companyName()],
      size: faker.random.number(),
      website: faker.internet.url(),
      industry: faker.random.word(),
      tagIds: _company.tagIds,
      customFieldsData: {},
    };

    const mutation = `
      mutation companiesEdit($_id: String! ${commonParamDefs}) {
        companiesEdit(_id: $_id ${commonParams}) {
          _id
          primaryName
          names
          size
          website
          industry
          tagIds
          customFieldsData
        }
      }
    `;

    const company = await graphqlRequest(mutation, 'companiesEdit', args, context);

    expect(company._id).toBe(args._id);
    expect(company.primaryName).toBe(args.primaryName);
    expect(company.names).toEqual(expect.arrayContaining(args.names));
    expect(company.size).toBe(args.size);
    expect(company.website).toBe(args.website);
    expect(company.industry).toBe(args.industry);
    expect(expect.arrayContaining(company.tagIds)).toEqual(args.tagIds);
    expect(company.customFieldsData).toEqual(args.customFieldsData);
  });

  test('Edit customer of company', async () => {
    const args = {
      _id: _company._id,
      customerIds: [_customer._id],
    };

    const mutation = `
      mutation companiesEditCustomers(
        $_id: String!
        $customerIds: [String]
      ) {
        companiesEditCustomers(
          _id: $_id
          customerIds: $customerIds
        ) {
          _id
        }
      }
    `;

    await graphqlRequest(mutation, 'companiesEditCustomers', args, context);

    const customer = await Customers.findOne({ _id: _customer._id });

    if (!customer) {
      throw new Error('Customer not found');
    }

    expect(customer.companyIds).toContain(_company._id);
  });

  test('Remove company', async () => {
    const mutation = `
      mutation companiesRemove($companyIds: [String]) {
        companiesRemove(companyIds: $companyIds)
      }
    `;

    await graphqlRequest(mutation, 'companiesRemove', { companyIds: [_company._id] }, context);

    expect(await Companies.find({ companyIds: [_company._id] })).toEqual([]);
  });

  test('Merge company', async () => {
    const args = {
      companyIds: [_company._id],
      companyFields: {
        primaryName: faker.company.companyName(),
      },
    };

    const mutation = `
      mutation companiesMerge($companyIds: [String] $companyFields: JSON) {
        companiesMerge(companyIds: $companyIds companyFields: $companyFields) {
          _id
          primaryName
          names
        }
      }
    `;

    const company = await graphqlRequest(mutation, 'companiesMerge', args, context);

    expect(company.primaryName).toBe(args.companyFields.primaryName);
  });
});
