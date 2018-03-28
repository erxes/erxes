/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { Brands } from '../db/models';
import { graphqlRequest, connect, disconnect } from '../db/connection';
import { brandFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

const generateData = n => {
  const promises = [];

  let i = 1;

  while (i <= n) {
    promises.push(brandFactory());

    i++;
  }

  return Promise.all(promises);
};

describe('brandQueries', () => {
  afterEach(async () => {
    // Clearing test data
    await Brands.remove({});
  });

  test('Brands', async () => {
    const args = {
      page: 1,
      perPage: 5,
    };

    await generateData(5);

    const query = `
      query brands($page: Int $perPage: Int) {
        brands(page: $page perPage: $perPage) {
          _id
        }
      }
    `;

    const response = await graphqlRequest(query, 'brands', args);

    expect(response.length).toBe(5);
  });

  test('Brand detail', async () => {
    const query = `
      query brandDetail($_id: String!) {
        brandDetail(_id: $_id) {
          _id
        }
      }
    `;

    const brand = await brandFactory();

    const response = await graphqlRequest(query, 'brandDetail', { _id: brand._id });

    expect(response._id).toBe(brand._id);
  });

  test('Get brand total count', async () => {
    const query = `
      query brandsTotalCount {
        brandsTotalCount
      }
    `;

    await generateData(5);

    const brandsCount = await graphqlRequest(query, 'brandsTotalCount');

    expect(brandsCount).toBe(5);
  });

  test('Get last brand', async () => {
    const query = `
      query brandsGetLast {
        brandsGetLast {
          _id
        }
      }
    `;

    await generateData(4);

    const brand = await brandFactory();

    const lastBrand = await graphqlRequest(query, 'brandsGetLast');

    expect(lastBrand._id).toBe(brand._id);
  });
});
