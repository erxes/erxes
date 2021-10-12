import { graphqlRequest } from '../db/connection';
import {
  companyFactory,
  conformityFactory,
  customerFactory,
  segmentFactory,
  tagsFactory
} from '../db/factories';
import {
  Companies,
  Conformities,
  Customers,
  Segments,
  Tags
} from '../db/models';
import * as sinon from 'sinon';
import * as elk from '../elasticsearch';

import './setup.ts';

describe('companyQueries', () => {
  const commonParamDefs = `
    $page: Int
    $perPage: Int
    $segment: String
    $tag: String
    $ids: [String]
    $searchValue: String
    $brand: String
  `;

  const commonParams = `
    page: $page
    perPage: $perPage
    segment: $segment
    tag: $tag
    ids: $ids
    searchValue: $searchValue
    brand: $brand
  `;

  const qryCompanies = `
    query companies(${commonParamDefs}) {
      companies(${commonParams}) {
        _id
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
    query companyCounts(${commonParamDefs}, $only: String) {
      companyCounts(${commonParams}, only: $only)
    }
  `;

  let mock;

  beforeEach(async () => {
    mock = sinon.stub(elk, 'fetchElk').callsFake(() => {
      return Promise.resolve({ hits: { hits: [] } });
    });
  });

  afterEach(async () => {
    // Clearing test data
    await Companies.deleteMany({});
    await Tags.deleteMany({});
    await Segments.deleteMany({});
    await Customers.deleteMany({});
    await Conformities.deleteMany({});

    mock.restore();
  });

  test('Companies', async () => {
    await companyFactory({});
    await companyFactory({});
    await companyFactory({});
    await companyFactory({});
    await companyFactory({});

    const args = { page: 1, perPage: 3 };
    await graphqlRequest(qryCompanies, 'companies', args);
  });

  test('Main companies', async () => {
    await companyFactory({});
    await companyFactory({});
    await companyFactory({});
    await companyFactory({});

    const args = { page: 1, perPage: 3 };
    await graphqlRequest(qryCompaniesMain, 'companiesMain', args);
  });

  test('Count companies by segment', async () => {
    await segmentFactory({ contentType: 'company' });

    await graphqlRequest(qryCount, 'companyCounts', {
      only: 'bySegment'
    });
  });

  test('Company count by tag', async () => {
    await tagsFactory({ type: 'company' });
    await tagsFactory({ type: 'customer' });

    await graphqlRequest(qryCount, 'companyCounts', {
      only: 'byTag'
    });
  });

  test('Company detail', async () => {
    const tag = await tagsFactory({ type: 'company' });
    const customer = await customerFactory();
    const company = await companyFactory({ tagIds: [tag._id] });
    const conformity = await conformityFactory({
      mainType: 'company',
      mainTypeId: company._id,
      relType: 'customer',
      relTypeId: customer._id
    });

    mock.restore();

    const cmock = sinon.stub(elk, 'fetchElk').callsFake(() => {
      return Promise.resolve({
        took: 0,
        timed_out: false,
        _shards: {
          total: 1,
          successful: 1,
          skipped: 0,
          failed: 0
        },
        hits: {
          total: {
            value: 1,
            relation: 'eq'
          },
          max_score: 10.735046,
          hits: [
            {
              _index: 'erxes__conformities',
              _type: '_doc',
              _id: conformity._id,
              _score: 10.735046,
              _source: {
                mainType: 'company',
                mainTypeId: company._id,
                relType: 'customer',
                relTypeId: customer._id,
                __v: 0
              }
            }
          ]
        }
      });
    });

    const qry = `
      query companyDetail($_id: String!) {
        companyDetail(_id: $_id) {
          _id
          createdAt
          modifiedAt

          primaryName
          names
          size
          industry
          plan

          parentCompanyId
          primaryEmail
          emails
          ownerId
          primaryPhone
          phones
          businessType
          description
          isSubscribed
          links
          customers { _id }
          owner { _id }
          parentCompany { _id }

          tagIds

          customFieldsData

          getTags { _id }
        }
      }
    `;

    const response = await graphqlRequest(qry, 'companyDetail', {
      _id: company._id
    });

    cmock.restore();
    expect(response._id).toBe(company._id);
  });
});
