import { graphqlRequest } from '../db/connection';
import { brandFactory } from '../db/factories';
import { Brands } from '../db/models';

import './setup.ts';

describe('brandQueries', () => {
  afterEach(async () => {
    // Clearing test data
    await Brands.deleteMany({});
  });

  test('Brands', async () => {
    const args = {
      page: 1,
      perPage: 2,
    };

    await brandFactory({});
    await brandFactory({});
    await brandFactory({});

    const qry = `
      query brands($page: Int $perPage: Int) {
        brands(page: $page perPage: $perPage) {
          _id
          name
          description
          code
          userId
          createdAt
          emailConfig
          integrations { _id }
        }
      }
    `;

    const response = await graphqlRequest(qry, 'brands', args);

    expect(response.length).toBe(2);
  });

  test('Brand detail', async () => {
    const qry = `
      query brandDetail($_id: String!) {
        brandDetail(_id: $_id) {
          _id
        }
      }
    `;

    const brand = await brandFactory({});

    const response = await graphqlRequest(qry, 'brandDetail', { _id: brand._id });

    expect(response._id).toBe(brand._id);
  });

  test('Get brand total count', async () => {
    const qry = `
      query brandsTotalCount {
        brandsTotalCount
      }
    `;

    await brandFactory({});
    await brandFactory({});
    await brandFactory({});

    const brandsCount = await graphqlRequest(qry, 'brandsTotalCount');

    expect(brandsCount).toBe(3);
  });

  test('Get last brand', async () => {
    const qry = `
      query brandsGetLast {
        brandsGetLast {
          _id
        }
      }
    `;

    await brandFactory({});
    await brandFactory({});

    const brand = await brandFactory({});

    const lastBrand = await graphqlRequest(qry, 'brandsGetLast');

    expect(lastBrand._id).toBe(brand._id);
  });
});
