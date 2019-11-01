import { graphqlRequest } from '../db/connection';
import { productCategoryFactory, productFactory, userFactory } from '../db/factories';
import { ProductCategories, Products } from '../db/models';

import './setup.ts';

describe('Test products mutations', () => {
  let product;
  let context;
  let productCategory;

  const commonParamDefs = `
    $name: String!,
    $type: String!,
    $description: String,
    $categoryId: String,
    $sku: String
    $code: String
  `;

  const commonParams = `
    name: $name
    type: $type
    description: $description,
    categoryId: $categoryId
    sku: $sku
    code: $code
  `;

  beforeEach(async () => {
    // Creating test data
    product = await productFactory({ type: 'product' });
    productCategory = await productCategoryFactory();
    context = { user: await userFactory({}) };
  });

  afterEach(async () => {
    // Clearing test data
    await Products.deleteMany({});
    await ProductCategories.deleteMany({});
  });

  test('Create product', async () => {
    const args = {
      name: product.name,
      type: product.type,
      sku: product.sku,
      description: product.description,
      categoryId: productCategory._id,
      code: '123',
    };

    const mutation = `
      mutation productsAdd(${commonParamDefs}) {
        productsAdd(${commonParams}) {
          _id
          name
          type
          description
          sku
          code
        }
      }
    `;

    const createdProduct = await graphqlRequest(mutation, 'productsAdd', args, context);

    expect(createdProduct.name).toEqual(args.name);
    expect(createdProduct.type).toEqual(args.type);
    expect(createdProduct.description).toEqual(args.description);
    expect(createdProduct.sku).toEqual(args.sku);
    expect(createdProduct.code).toEqual(args.code);
  });

  test('Update product', async () => {
    const args = {
      _id: product._id,
      name: product.name,
      type: product.type,
      sku: product.sku,
      description: product.description,
      code: product.code,
    };

    const mutation = `
      mutation productsEdit($_id: String!, ${commonParamDefs}) {
        productsEdit(_id: $_id, ${commonParams}) {
          _id
          name
          type
          description
          sku
          code
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
      mutation productsRemove($productIds: [String!]) {
        productsRemove(productIds: $productIds)
      }
    `;

    await graphqlRequest(mutation, 'productsRemove', { productIds: [product._id] }, context);

    expect(await Products.findOne({ _id: product._id })).toBe(null);
  });
});
