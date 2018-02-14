/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Products, Users } from '../db/models';
import { productFactory, userFactory } from '../db/factories';
import productsMutations from '../data/resolvers/mutations/products';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Test products mutations', () => {
  let _product;
  let _user;
  let doc;

  beforeEach(async () => {
    // Creating test data
    _product = await productFactory({ type: 'product' });
    _user = await userFactory();

    doc = {
      name: _product.name,
      type: _product.type,
      sku: _product.sku,
      description: _product.description,
    };
  });

  afterEach(async () => {
    // Clearing test data
    await Products.remove({});
    await Users.remove({});
  });

  test('Check login required', async () => {
    expect.assertions(3);

    const check = async fn => {
      try {
        await fn({}, {}, {});
      } catch (e) {
        expect(e.message).toEqual('Login required');
      }
    };

    // add
    check(productsMutations.productsAdd);

    // edit
    check(productsMutations.productsEdit);

    // remove
    check(productsMutations.productsRemove);
  });

  test('Create product', async () => {
    Products.createProduct = jest.fn();
    await productsMutations.productsAdd({}, doc, { user: _user });

    expect(Products.createProduct).toBeCalledWith(doc);
    expect(Products.createProduct.mock.calls.length).toBe(1);
  });

  test('Update product', async () => {
    Products.updateProduct = jest.fn();
    await productsMutations.productsEdit(null, { _id: _product._id, ...doc }, { user: _user });

    expect(Products.updateProduct).toBeCalledWith(_product._id, doc);
    expect(Products.updateProduct.mock.calls.length).toBe(1);
  });

  test('Remove product', async () => {
    Products.removeProduct = jest.fn();
    await productsMutations.productsRemove({}, { _id: _product.id }, { user: _user });

    expect(Products.removeProduct.mock.calls.length).toBe(1);
  });
});
