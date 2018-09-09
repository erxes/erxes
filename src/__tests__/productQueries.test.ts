import { PRODUCT_TYPES } from '../data/constants';
import { connect, disconnect, graphqlRequest } from '../db/connection';
import { productFactory } from '../db/factories';
import { Products } from '../db/models';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('productQueries', () => {
  afterEach(async () => {
    // Clearing test data
    await Products.remove({});
  });

  test('Products', async () => {
    const args = {
      page: 1,
      perPage: 2,
    };

    await productFactory();
    await productFactory();
    await productFactory();

    const qry = `
      query products($page: Int $perPage: Int) {
        products(page: $page perPage: $perPage) {
          _id
          name
          type
          description
          sku
          createdAt
        }
      }
    `;

    const response = await graphqlRequest(qry, 'products', args);

    expect(response.length).toBe(2);
  });

  test('Products total count', async () => {
    const args = { type: PRODUCT_TYPES.PRODUCT };

    await productFactory({ type: PRODUCT_TYPES.PRODUCT });
    await productFactory({ type: PRODUCT_TYPES.SERVICE });
    await productFactory({ type: PRODUCT_TYPES.PRODUCT });

    const qry = `
      query productsTotalCount($type: String) {
        productsTotalCount(type: $type)
      }
    `;

    const response = await graphqlRequest(qry, 'productsTotalCount', args);

    expect(response).toBe(2);
  });
});
