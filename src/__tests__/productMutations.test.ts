import { connect, disconnect, graphqlRequest } from '../db/connection';
import { productFactory, userFactory } from '../db/factories';
import { Products } from '../db/models';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Test products mutations', () => {
  let product;
  let context;

  const commonParamDefs = `
    $name: String!,
    $type: String!,
    $description: String,
    $sku: String
  `;

  const commonParams = `
    name: $name
    type: $type
    description: $description,
    sku: $sku
  `;

  beforeEach(async () => {
    // Creating test data
    product = await productFactory({ type: 'product' });
    context = { user: await userFactory({ role: 'admin' }) };
  });

  afterEach(async () => {
    // Clearing test data
    await Products.remove({});
  });

  test('Create product', async () => {
    const args = {
      name: product.name,
      type: product.type,
      sku: product.sku,
      description: product.description,
    };

    const mutation = `
      mutation productsAdd(${commonParamDefs}) {
        productsAdd(${commonParams}) {
          _id
          name
          type
          description
          sku
        }
      }
    `;

    const createdProduct = await graphqlRequest(mutation, 'productsAdd', args, context);

    expect(createdProduct.name).toEqual(args.name);
    expect(createdProduct.type).toEqual(args.type);
    expect(createdProduct.description).toEqual(args.description);
    expect(createdProduct.sku).toEqual(args.sku);
  });

  test('Update product', async () => {
    const args = {
      _id: product._id,
      name: product.name,
      type: product.type,
      sku: product.sku,
      description: product.description,
    };

    const mutation = `
      mutation productsEdit($_id: String!, ${commonParamDefs}) {
        productsEdit(_id: $_id, ${commonParams}) {
          _id
          name
          type
          description
          sku
        }
      }
    `;

    const updatedProduct = await graphqlRequest(mutation, 'productsEdit', args, context);

    expect(updatedProduct.name).toEqual(args.name);
    expect(updatedProduct.type).toEqual(args.type);
    expect(updatedProduct.description).toEqual(args.description);
    expect(updatedProduct.sku).toEqual(args.sku);
  });

  test('Remove product', async () => {
    const mutation = `
      mutation productsRemove($_id: String!) {
        productsRemove(_id: $_id)
      }
    `;

    await graphqlRequest(mutation, 'productsRemove', { _id: product._id }, context);

    expect(await Products.findOne({ _id: product._id })).toBe(null);
  });
});
