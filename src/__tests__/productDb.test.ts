import { connect, disconnect } from '../db/connection';
import { dealFactory, productFactory } from '../db/factories';
import { Deals, Products } from '../db/models';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Test products model', () => {
  let product;
  let deal;

  beforeEach(async () => {
    // Creating test data
    product = await productFactory({ type: 'service' });
    deal = await dealFactory({ productsData: [{ productId: product._id }] });
  });

  afterEach(async () => {
    // Clearing test data
    await Products.remove({});
    await Deals.remove({});
  });

  test('Create product', async () => {
    const productObj = await Products.createProduct({
      name: product.name,
      type: product.type,
      description: product.description,
      sku: product.sku,
    });

    expect(productObj).toBeDefined();
    expect(productObj.name).toEqual(product.name);
    expect(productObj.type).toEqual(product.type);
    expect(productObj.description).toEqual(product.description);
    expect(productObj.sku).toEqual(product.sku);
  });

  test('Update product', async () => {
    const productObj = await Products.updateProduct(product._id, {
      name: `${product.name}-update`,
      type: `${product.type}-update`,
      description: `${product.description}-update`,
      sku: `${product.sku}-update`,
    });

    expect(productObj).toBeDefined();
    expect(productObj.name).toEqual(`${product.name}-update`);
    expect(productObj.type).toEqual(`${product.type}-update`);
    expect(productObj.description).toEqual(`${product.description}-update`);
    expect(productObj.sku).toEqual(`${product.sku}-update`);
  });

  test('Remove product not found', async () => {
    expect.assertions(1);

    try {
      await Products.removeProduct(deal._id);
    } catch (e) {
      expect(e.message).toEqual('Product not found');
    }
  });

  test("Can't remove a product", async () => {
    expect.assertions(1);

    try {
      await Products.removeProduct(product._id);
    } catch (e) {
      expect(e.message).toEqual("Can't remove a product");
    }
  });

  test('Remove product', async () => {
    await Deals.update({ _id: deal._id }, { $set: { productsData: [] } });
    const isDeleted = await Products.removeProduct(product.id);

    expect(isDeleted).toBeTruthy();
  });
});
