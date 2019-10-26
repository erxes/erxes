import { dealFactory, productCategoryFactory, productFactory } from '../db/factories';
import { Deals, ProductCategories, Products } from '../db/models';

import { IDealDocument, IProductCategoryDocument, IProductDocument } from '../db/models/definitions/deals';
import './setup.ts';

describe('Test products model', () => {
  let product: IProductDocument;
  let deal: IDealDocument;
  let deal2: IDealDocument;
  let productCategory: IProductCategoryDocument;

  beforeEach(async () => {
    // Creating test data
    product = await productFactory({ type: 'service' });
    productCategory = await productCategoryFactory({});
    deal = await dealFactory({ productsData: [{ productId: product._id }] });
    deal2 = await dealFactory({ productsData: [{ productId: product._id }] });
  });

  afterEach(async () => {
    // Clearing test data
    await Products.deleteMany({});
    await Deals.deleteMany({});
    await ProductCategories.deleteMany({});
  });

  test('Create product', async () => {
    const productObj = await Products.createProduct({
      name: product.name,
      type: product.type,
      description: product.description,
      sku: product.sku,
      categoryId: productCategory._id,
      code: '123',
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
      categoryId: productCategory._id,
      code: '321',
    });

    expect(productObj).toBeDefined();
    expect(productObj.name).toEqual(`${product.name}-update`);
    expect(productObj.type).toEqual(`${product.type}-update`);
    expect(productObj.description).toEqual(`${product.description}-update`);
    expect(productObj.sku).toEqual(`${product.sku}-update`);
  });

  test('Can not remove products', async () => {
    expect.assertions(1);

    try {
      await Products.removeProducts([product._id]);
    } catch (e) {
      expect(e.message).toEqual(`Can not remove products. Following deals are used ${deal.name},${deal2.name}`);
    }
  });

  test('Remove product', async () => {
    await Deals.updateOne({ _id: deal._id }, { $set: { productsData: [] } });
    await Deals.updateOne({ _id: deal2._id }, { $set: { productsData: [] } });

    const isDeleted = await Products.removeProducts([product._id]);

    expect(isDeleted).toBeTruthy();
  });
});
