/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Products, Deals } from '../db/models';
import { productFactory, dealFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Test products model', () => {
  let _product;
  let _deal;

  beforeEach(async () => {
    // Creating test data
    _product = await productFactory({ type: 'service' });
    _deal = await dealFactory({ productIds: [_product._id] });
  });

  afterEach(async () => {
    // Clearing test data
    await Products.remove({});
    await Deals.remove({});
  });

  test('Create product', async () => {
    const productObj = await Products.createProduct({
      name: _product.name,
      type: _product.type,
      description: _product.description,
      sku: _product.sku,
    });

    expect(productObj).toBeDefined();
    expect(productObj.name).toEqual(_product.name);
    expect(productObj.type).toEqual(_product.type);
    expect(productObj.description).toEqual(_product.description);
    expect(productObj.sku).toEqual(_product.sku);
  });

  test('Update product', async () => {
    const productObj = await Products.updateProduct(_product._id, {
      name: `${_product.name}-update`,
      type: `${_product.type}-update`,
      description: `${_product.description}-update`,
      sku: `${_product.sku}-update`,
    });

    expect(productObj).toBeDefined();
    expect(productObj.name).toEqual(`${_product.name}-update`);
    expect(productObj.type).toEqual(`${_product.type}-update`);
    expect(productObj.description).toEqual(`${_product.description}-update`);
    expect(productObj.sku).toEqual(`${_product.sku}-update`);
  });

  test('Remove product not found', async () => {
    expect.assertions(1);
    try {
      await Products.removeProduct(_deal._id);
    } catch (e) {
      expect(e.message).toEqual('Product not found');
    }
  });

  test("Can't remove a product", async () => {
    expect.assertions(1);
    try {
      await Products.removeProduct(_product._id);
    } catch (e) {
      expect(e.message).toEqual("Can't remove a product");
    }
  });

  test('Remove product', async () => {
    await Deals.update({ _id: _deal._id }, { $set: { productIds: [] } });
    const isDeleted = await Products.removeProduct(_product.id);
    expect(isDeleted).toBeTruthy();
  });
});
