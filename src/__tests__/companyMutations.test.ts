import * as faker from 'faker';
import { graphqlRequest } from '../db/connection';
import { companyFactory, tagsFactory, userFactory } from '../db/factories';
import { Companies, Customers, Users } from '../db/models';

import './setup.ts';

describe('Companies mutations', () => {
  let _company;
  let _user;
  let context;

  const commonParamDefs = `
    $primaryName: String
    $names: [String]
    $primaryPhone: String
    $phones: [String]
    $primaryEmail: String
    $emails: [String]
    $size: Int
    $industry: String
    $tagIds: [String]
    $customFieldsData: JSON
    $parentCompanyId: String
    $ownerId: String
  `;

  const commonParams = `
    primaryName: $primaryName
    names: $names
    primaryPhone: $primaryPhone
    phones: $phones
    primaryEmail: $primaryEmail
    emails: $emails
    size: $size
    industry: $industry
    tagIds: $tagIds
    customFieldsData: $customFieldsData
    parentCompanyId: $parentCompanyId
    ownerId: $ownerId
  `;

  beforeEach(async () => {
    // Creating test data
    _company = await companyFactory({});
    _user = await userFactory({});

    context = { user: _user };
  });

  afterEach(async () => {
    // Clearing test data
    await Companies.deleteMany({});
    await Customers.deleteMany({});
    await Users.deleteMany({});
  });

  test('Add company', async () => {
    const parent = await companyFactory();
    const company = await companyFactory();

    const args = {
      primaryName: faker.company.companyName(),
      names: [faker.company.companyName()],
      primaryPhone: faker.random.number().toString(),
      phones: [faker.random.number().toString()],
      primaryEmail: faker.internet.email(),
      emails: [faker.internet.email()],
      size: faker.random.number(),
      industry: 'Airlines',
      tagIds: company.tagIds,
      parentCompanyId: parent._id,
    };

    const mutation = `
      mutation companiesAdd(${commonParamDefs}) {
        companiesAdd(${commonParams}) {
          primaryName
          names
          primaryPhone
          phones
          primaryEmail
          emails
          size
          industry
          tagIds
          customFieldsData
          parentCompanyId
        }
      }
    `;

    const result = await graphqlRequest(mutation, 'companiesAdd', args, context);

    expect(result.primaryName).toBe(args.primaryName);
    expect(result.primaryPhone).toBe(args.primaryPhone);
    expect(result.primaryEmail).toBe(args.primaryEmail);
    expect(result.names).toEqual(expect.arrayContaining(args.names));
    expect(result.phones).toEqual(expect.arrayContaining(args.phones));
    expect(result.emails).toEqual(expect.arrayContaining(args.emails));
    expect(result.size).toBe(args.size);
    expect(result.industry).toBe(args.industry);
    expect(expect.arrayContaining(result.tagIds)).toEqual(args.tagIds);
    expect(result.customFieldsData.length).toEqual(0);
    expect(result.parentCompanyId).toBe(parent._id);
  });

  test('Edit company', async () => {
    const parent = await companyFactory();
    const tag1 = await tagsFactory();
    const tag2 = await tagsFactory();

    const merged = await companyFactory();
    const company = await companyFactory({
      tagIds: [tag1._id],
      mergedIds: [merged._id],
    });

    const args = {
      _id: company._id,
      primaryName: faker.company.companyName(),
      names: [faker.company.companyName()],
      primaryPhone: faker.random.number().toString(),
      phones: [faker.random.number().toString()],
      primaryEmail: faker.internet.email(),
      emails: [faker.internet.email()],
      size: faker.random.number(),
      industry: faker.random.word(),
      ownerId: _user._id,
      parentCompanyId: parent._id,
      tagIds: [tag2._id],
    };

    const mutation = `
      mutation companiesEdit($_id: String! ${commonParamDefs}) {
        companiesEdit(_id: $_id ${commonParams}) {
          _id
          primaryName
          names
          primaryPhone
          phones
          primaryEmail
          emails
          size
          industry
          tagIds
          customFieldsData
          ownerId
          parentCompanyId
          mergedIds
        }
      }
    `;

    const result = await graphqlRequest(mutation, 'companiesEdit', args, context);

    expect(result._id).toBe(args._id);
    expect(result.primaryName).toBe(args.primaryName);
    expect(result.primaryPhone).toBe(args.primaryPhone);
    expect(result.primaryEmail).toBe(args.primaryEmail);
    expect(result.names).toEqual(expect.arrayContaining(args.names));
    expect(result.phones).toEqual(expect.arrayContaining(args.phones));
    expect(result.emails).toEqual(expect.arrayContaining(args.emails));
    expect(result.size).toBe(args.size);
    expect(result.industry).toBe(args.industry);
    expect(expect.arrayContaining(result.tagIds)).toEqual(args.tagIds);
    expect(result.customFieldsData.length).toEqual(0);
    expect(result.ownerId).toBe(_user._id);
    expect(result.parentCompanyId).toBe(parent._id);
    expect(result.mergedIds.length).toBe(1);
  });

  test('Remove company', async () => {
    const mutation = `
      mutation companiesRemove($companyIds: [String]) {
        companiesRemove(companyIds: $companyIds)
      }
    `;

    const tag = await tagsFactory();

    const company = await companyFactory({
      ownerId: _user._id,
      mergedIds: [_company._id],
      tagIds: [tag._id],
    });

    await graphqlRequest(mutation, 'companiesRemove', { companyIds: [company._id] }, context);

    expect(await Companies.find({ companyIds: [company._id] })).toEqual([]);
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
