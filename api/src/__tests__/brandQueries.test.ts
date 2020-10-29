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
    await brandFactory({ name: 'name 1' });
    await brandFactory({ name: 'name 2' });
    await brandFactory({ name: 'name 3' });

    const qry = `
      query brands($searchValue: String) {
        brands(searchValue: $searchValue) {
          _id
        }
      }
    `;

    let response = await graphqlRequest(qry, 'brands');

    expect(response.length).toBe(3);

    await brandFactory({ name: 'search 1' });
    await brandFactory({ name: 'search 2' });

    const args = {
      searchValue: 'search'
    };

    response = await graphqlRequest(qry, 'brands', args);

    expect(response.length).toBe(2);
  });

  test('Brand detail', async () => {
    const qry = `
      query brandDetail($_id: String!) {
        brandDetail(_id: $_id) {
          _id
          integrations {
            _id
          }
        }
      }
    `;

    const brand = await brandFactory({});

    const response = await graphqlRequest(qry, 'brandDetail', {
      _id: brand._id
    });

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

    const brand = await brandFactory({});

    const lastBrand = await graphqlRequest(qry, 'brandsGetLast');

    expect(lastBrand._id).toBe(brand._id);
  });

  test('Default email template', async () => {
    const qry = `
      query brandsGetDefaultEmailConfig {
        brandsGetDefaultEmailConfig
      }
    `;

    const template = await graphqlRequest(qry, 'brandsGetDefaultEmailConfig');

    expect(template).toBeDefined();
  });
});
