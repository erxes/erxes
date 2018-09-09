import * as faker from 'faker';
import { connect, disconnect, graphqlRequest } from '../db/connection';
import {
  brandFactory,
  companyFactory,
  customerFactory,
  integrationFactory,
  segmentFactory,
  tagsFactory,
} from '../db/factories';
import { Companies, Segments, Tags } from '../db/models';

beforeAll(() => connect());
afterAll(() => disconnect());

const count = response => {
  return Object.keys(response).length;
};

describe('companyQueries', () => {
  const commonParamDefs = `
    $page: Int
    $perPage: Int
    $segment: String
    $tag: String
    $ids: [String]
    $searchValue: String
    $lifecycleState: String
    $leadStatus: String
    $brand: String
  `;

  const commonParams = `
    page: $page
    perPage: $perPage
    segment: $segment
    tag: $tag
    ids: $ids
    searchValue: $searchValue
    lifecycleState: $lifecycleState
    leadStatus: $leadStatus
    brand: $brand
  `;

  const qryCompanies = `
    query companies(${commonParamDefs}) {
      companies(${commonParams}) {
        _id
        createdAt
        modifiedAt

        primaryName
        names
        size
        industry
        plan

        parentCompanyId
        email
        ownerId
        phone
        leadStatus
        lifecycleState
        businessType
        description
        doNotDisturb
        links {
          linkedIn
          twitter
          facebook
          github
          youtube
          website
        }
        owner { _id }
        parentCompany { _id }

        tagIds

        customFieldsData

        customers { _id }
        deals { _id }
        getTags { _id }
      }
    }
  `;

  const qryCompaniesMain = `
    query companiesMain(${commonParamDefs}) {
      companiesMain(${commonParams}) {
        list {
          _id
          tagIds
          primaryName
          names
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
  const plan = 'plan';

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

    const args = { page: 1, perPage: 3 };
    const responses = await graphqlRequest(qryCompanies, 'companies', args);

    expect(responses.length).toBe(3);
  });

  test('Companies filtered by ids', async () => {
    const company1 = await companyFactory({});
    const company2 = await companyFactory({});
    const company3 = await companyFactory({});

    await companyFactory({});
    await companyFactory({});
    await companyFactory({});

    const ids = [company1._id, company2._id, company3._id];

    const responses = await graphqlRequest(qryCompanies, 'companies', { ids });

    expect(responses.length).toBe(3);
  });

  test('Companies filtered by tag', async () => {
    const tag = await tagsFactory();

    await companyFactory();
    await companyFactory();
    await companyFactory({ tagIds: [tag._id] });
    await companyFactory({ tagIds: [tag._id] });

    const tagResponse = await Tags.findOne({}, '_id');

    const responses = await graphqlRequest(qryCompanies, 'companies', {
      tag: tagResponse._id,
    });

    expect(responses.length).toBe(2);
  });

  test('Companies filtered by leadStatus', async () => {
    await companyFactory();
    await companyFactory();
    await companyFactory({ leadStatus: 'new' });
    await companyFactory({ leadStatus: 'new' });

    const responses = await graphqlRequest(qryCompanies, 'companies', {
      leadStatus: 'new',
    });

    expect(responses.length).toBe(2);
  });

  test('Companies filtered by lifecycleState', async () => {
    await companyFactory();
    await companyFactory();
    await companyFactory({ lifecycleState: 'subscriber' });
    await companyFactory({ lifecycleState: 'subscriber' });

    const responses = await graphqlRequest(qryCompanies, 'companies', {
      lifecycleState: 'subscriber',
    });

    expect(responses.length).toBe(2);
  });

  test('Companies filtered by segment', async () => {
    await companyFactory({ names: [name], primaryName: name });
    await companyFactory();
    await companyFactory();

    const args = {
      contentType: 'company',
      conditions: [{
        field: 'primaryName',
        operator: 'c',
        value: name,
        type: 'string',
      }],
    };

    const segment = await segmentFactory(args);

    const response = await graphqlRequest(qryCompanies, 'companies', {
      segment: segment._id,
    });

    expect(response.length).toBe(1);
  });

  test('Companies filtered by search value', async () => {
    await companyFactory({ names: [name], primaryName: name });
    await companyFactory({ plan });
    await companyFactory({ industry: 'Banks' });

    // companies by name ==============
    let responses = await graphqlRequest(qryCompanies, 'companies', {
      searchValue: name,
    });

    expect(responses.length).toBe(1);
    expect(responses[0].primaryName).toBe(name);

    // companies by industry ==========
    responses = await graphqlRequest(qryCompanies, 'companies', {
      searchValue: 'Banks',
    });

    expect(responses.length).toBe(1);
    expect(responses[0].industry).toBe('Banks');

    // companies by plan ==============
    responses = await graphqlRequest(qryCompanies, 'companies', {
      searchValue: plan,
    });

    expect(responses.length).toBe(1);
    expect(responses[0].plan).toBe(plan);
  });

  test('Companies filtered by brandId', async () => {
    const brand = await brandFactory({});
    const integration = await integrationFactory({ brandId: brand._id });
    const integrationId = integration._id;

    const company1 = await companyFactory({});
    const company2 = await companyFactory({});
    await companyFactory({});

    await customerFactory({ integrationId, companyIds: [company1._id] });
    await customerFactory({ integrationId, companyIds: [company2._id] });

    const responses = await graphqlRequest(qryCompanies, 'companies', {
      brand: brand._id,
    });

    expect(responses.length).toBe(2);
  });

  test('Main companies', async () => {
    await companyFactory({});
    await companyFactory({});
    await companyFactory({});
    await companyFactory({});

    const args = { page: 1, perPage: 3 };
    const responses = await graphqlRequest(qryCompaniesMain, 'companiesMain', args);

    expect(responses.list.length).toBe(3);
    expect(responses.totalCount).toBe(4);
  });

  test('Count companies', async () => {
    // Creating test data
    await companyFactory({});
    await companyFactory({});

    await segmentFactory({ contentType: 'company' });
    await tagsFactory({ type: 'company' });

    const response = await graphqlRequest(qryCount, 'companyCounts');

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

  test('Company count by leadStatus', async () => {
    await companyFactory({});
    await companyFactory({});
    await companyFactory({ leadStatus: 'new' });
    await companyFactory({ leadStatus: 'new' });

    const response = await graphqlRequest(qryCount, 'companyCounts');

    expect(response.byLeadStatus.open).toBe(2);
    expect(response.byLeadStatus.new).toBe(2);
  });

  test('Company count by lifecycleState', async () => {
    await companyFactory({});
    await companyFactory({});
    await companyFactory({ lifecycleState: 'subscriber' });
    await companyFactory({ lifecycleState: 'subscriber' });

    const response = await graphqlRequest(qryCount, 'companyCounts');

    expect(response.byLifecycleState.subscriber).toBe(2);
    expect(response.byLifecycleState.lead).toBe(2);
  });

  test('Company count by segment', async () => {
    await companyFactory({});
    await companyFactory({});

    await segmentFactory({ contentType: 'company' });
    await segmentFactory();

    const response = await graphqlRequest(qryCount, 'companyCounts');

    expect(count(response.bySegment)).toBe(1);
  });

  test('Company count by brand', async () => {
    const brand = await brandFactory({});
    const integration = await integrationFactory({ brandId: brand._id });
    const integrationId = integration._id;

    const company1 = await companyFactory({});
    const company2 = await companyFactory({});
    await companyFactory({});

    await customerFactory({ integrationId, companyIds: [company1._id] });
    await customerFactory({ integrationId, companyIds: [company2._id] });

    const response = await graphqlRequest(qryCount, 'companyCounts', {
      brand: brand._id,
    });

    expect(response.byBrand[brand._id]).toBe(2);
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

    const response = await graphqlRequest(qry, 'companyDetail', {
      _id: company._id,
    });

    expect(response._id).toBe(company._id);
  });
});
