import { graphqlRequest } from '../db/connection';
import { brandFactory, companyFactory, integrationFactory, segmentFactory, tagsFactory } from '../db/factories';
import { Companies, Segments, Tags } from '../db/models';

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

  afterEach(async () => {
    // Clearing test data
    await Companies.deleteMany({});
    await Tags.deleteMany({});
    await Segments.deleteMany({});
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
      only: 'bySegment',
    });
  });

  test('Company count by tag', async () => {
    await tagsFactory({ type: 'company' });
    await tagsFactory({ type: 'customer' });

    await graphqlRequest(qryCount, 'companyCounts', {
      only: 'byTag',
    });
  });

  test('Company count by brand', async () => {
    const brand = await brandFactory({});
    await integrationFactory({ brandId: brand._id });

    await graphqlRequest(qryCount, 'companyCounts', {
      only: 'byBrand',
    });
  });

  test('Company detail', async () => {
    const company = await companyFactory();

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
          doNotDisturb
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
      _id: company._id,
    });

    expect(response._id).toBe(company._id);
  });
});
