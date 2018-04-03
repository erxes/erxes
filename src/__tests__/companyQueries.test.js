/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import faker from 'faker';
import { Companies, Tags, Segments } from '../db/models';
import { graphqlRequest, connect, disconnect } from '../db/connection';
import { tagsFactory, segmentFactory, companyFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

const count = response => {
  return Object.keys(response).length;
};

describe('companyQueries', () => {
  const commonParamDefs = `
    $page: Int,
    $perPage: Int,
    $segment: String,
    $tag: String,
    $ids: [String],
    $searchValue: String
  `;

  const commonParams = `
    page: $page
    perPage: $perPage
    segment: $segment
    tag: $tag
    ids: $ids
    searchValue: $searchValue
  `;

  const qryCompanies = `
    query companies(${commonParamDefs}) {
      companies(${commonParams}) {
        _id
        tagIds
        name
        website
        industry
        plan
      }
    }
  `;

  const qryCompaniesMain = `
    query companiesMain(${commonParamDefs}) {
      companiesMain(${commonParams}) {
        list {
          _id
          tagIds
          name
          website
          industry
          plan
        }
        totalCount
      }
    }
  `;

  const qryCount = `
    query companyCounts(${commonParamDefs}) {
      companyCounts(${commonParams})
    }
  `;

  const name = 'companyName';
  const website = faker.internet.url();
  const plan = faker.random.word();

  afterEach(async () => {
    // Clearing test data
    await Companies.remove({});
    await Tags.remove({});
    await Segments.remove({});
  });

  test('Companies', async () => {
    await companyFactory({});
    await companyFactory({});
    await companyFactory({});
    await companyFactory({});
    await companyFactory({});

    const args = { page: 1, perPage: 5 };
    const responses = await graphqlRequest(qryCompanies, 'companies', args);

    expect(responses.length).toBe(5);
  });

  test('Companies filtered by ids', async () => {
    await companyFactory({});
    await companyFactory({});
    await companyFactory({});
    await companyFactory({});
    await companyFactory({});

    const companies = await Companies.find({});
    const ids = companies.map(company => company._id);

    const responses = await graphqlRequest(qryCompanies, 'companies', { ids });

    expect(responses.length).toBe(5);
  });

  test('Companies filtered by tag', async () => {
    const tag = await tagsFactory();

    await companyFactory({ tagIds: tag._id });
    await companyFactory({ tagIds: tag._id });

    const tagResponse = await Tags.findOne({}, '_id');

    const responses = await graphqlRequest(qryCompanies, 'companies', { tag: tagResponse._id });

    expect(responses.length).toBe(2);
  });

  test('Companies filtered by segment', async () => {
    await companyFactory({ name });

    const args = {
      contentType: 'company',
      conditions: {
        field: 'name',
        operator: 'c',
        value: name,
        type: 'string',
      },
    };

    const segment = await segmentFactory(args);

    const response = await graphqlRequest(qryCompanies, 'companies', { segment: segment._id });

    expect(response.length).toBe(1);
  });

  test('Companies filtered by search value', async () => {
    await companyFactory({ name });
    await companyFactory({ website });
    await companyFactory({ plan });
    await companyFactory({ industry: 'Banks' });

    // companies by name ==============
    let responses = await graphqlRequest(qryCompanies, 'companies', { searchValue: name });

    expect(responses.length).toBe(1);
    expect(responses[0].name).toBe(name);

    // companies by website ===========
    responses = await graphqlRequest(qryCompanies, 'companies', { searchValue: website });

    expect(responses.length).toBe(1);
    expect(responses[0].website).toBe(website);

    // companies by industry ==========
    responses = await graphqlRequest(qryCompanies, 'companies', { searchValue: 'Banks' });

    expect(responses.length).toBe(1);
    expect(responses[0].industry).toBe('Banks');

    // companies by plan ==============
    responses = await graphqlRequest(qryCompanies, 'companies', { searchValue: plan });

    expect(responses.length).toBe(1);
    expect(responses[0].plan).toBe(plan);
  });

  test('Main companies', async () => {
    await companyFactory({});
    await companyFactory({});
    await companyFactory({});
    await companyFactory({});
    await companyFactory({});

    const args = { page: 1, perPage: 5 };
    const responses = await graphqlRequest(qryCompaniesMain, 'companiesMain', args);

    expect(responses.list.length).toBe(5);
    expect(responses.totalCount).toBe(5);
  });

  test('Main companies filtered by ids', async () => {
    await companyFactory({});
    await companyFactory({});
    await companyFactory({});
    await companyFactory({});
    await companyFactory({});

    const companies = await Companies.find({});
    const ids = companies.map(company => company._id);

    const responses = await graphqlRequest(qryCompaniesMain, 'companiesMain', { ids });

    expect(responses.list.length).toBe(5);
    expect(responses.totalCount).toBe(5);
  });

  test('Main companies filtered by tag', async () => {
    const tag = await tagsFactory();

    await companyFactory({ tagIds: tag._id });
    await companyFactory({ tagIds: tag._id });

    const tagResponse = await Tags.findOne({}, '_id');

    const responses = await graphqlRequest(qryCompaniesMain, 'companiesMain', {
      tag: tagResponse._id,
    });

    expect(responses.list.length).toBe(2);
    expect(responses.totalCount).toBe(2);
  });

  test('Main companies filtered by segment', async () => {
    await companyFactory({ name });

    const args = {
      contentType: 'company',
      conditions: {
        field: 'name',
        operator: 'c',
        value: name,
        type: 'string',
      },
    };

    const segment = await segmentFactory(args);

    const response = await graphqlRequest(qryCompaniesMain, 'companiesMain', {
      segment: segment._id,
    });

    expect(response.list.length).toBe(1);
    expect(response.totalCount).toBe(1);
  });

  test('Main companies filtered by search value', async () => {
    await companyFactory({ name });
    await companyFactory({ website });
    await companyFactory({ plan });
    await companyFactory({ industry: 'Banks' });

    // companies by name =============
    let responses = await graphqlRequest(qryCompaniesMain, 'companiesMain', { searchValue: name });

    expect(responses.list.length).toBe(1);
    expect(responses.totalCount).toBe(1);
    expect(responses.list[0].name).toBe(name);

    // companies by website ===========
    responses = await graphqlRequest(qryCompaniesMain, 'companiesMain', { searchValue: website });

    expect(responses.list.length).toBe(1);
    expect(responses.totalCount).toBe(1);
    expect(responses.list[0].website).toBe(website);

    // companies by industry ==========
    responses = await graphqlRequest(qryCompaniesMain, 'companiesMain', { searchValue: 'Banks' });

    expect(responses.list.length).toBe(1);
    expect(responses.totalCount).toBe(1);
    expect(responses.list[0].industry).toBe('Banks');

    // companies by plan ==============
    responses = await graphqlRequest(qryCompaniesMain, 'companiesMain', { searchValue: plan });

    expect(responses.list.length).toBe(1);
    expect(responses.totalCount).toBe(1);
    expect(responses.list[0].plan).toBe(plan);
  });

  test('Count companies', async () => {
    // Creating test data
    await companyFactory({});
    await companyFactory({});

    await segmentFactory({ contentType: 'company' });
    await tagsFactory({ type: 'company' });

    let response = await graphqlRequest(qryCount, 'companyCounts');

    expect(count(response.bySegment)).toBe(1);
    expect(count(response.byTag)).toBe(1);
  });

  test('Company count by tag', async () => {
    await companyFactory({});
    await companyFactory({});

    await tagsFactory({ type: 'company' });
    await tagsFactory({ type: 'customer' });

    const response = await graphqlRequest(qryCount, 'companyCounts');

    expect(count(response.byTag)).toBe(1);
  });

  test('Company count by segment', async () => {
    await companyFactory({});
    await companyFactory({});

    await segmentFactory({ contentType: 'company' });
    await segmentFactory();

    const response = await graphqlRequest(qryCount, 'companyCounts');

    expect(count(response.bySegment)).toBe(1);
  });

  test('Company detail', async () => {
    const company = await companyFactory();

    const qry = `
      query companyDetail($_id: String!) {
        companyDetail(_id: $_id) {
          _id
        }
      }
    `;

    const response = await graphqlRequest(qry, 'companyDetail', { _id: company._id });

    expect(response._id).toBe(company._id);
  });
});
