import {
  companyFactory,
  dealFactory,
  fieldFactory,
  productCategoryFactory,
  productFactory
} from '../db/factories';
import { Deals, ProductCategories, Products } from '../db/models';
import { PRODUCT_STATUSES } from '../db/models/definitions/constants';
import {
  IDealDocument,
  IProductCategoryDocument,
  IProductDocument
} from '../db/models/definitions/deals';
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

  test('Get product', async () => {
    try {
      await Products.getProduct({ _id: 'fakeId' });
    } catch (e) {
      expect(e.message).toBe('Product not found');
    }

    const response = await Products.getProduct({ _id: product._id });

    expect(response).toBeDefined();
  });

  test('Create product', async () => {
    const args: any = {
      name: product.name,
      type: product.type,
      description: product.description,
      sku: product.sku,
      categoryId: productCategory._id,
      code: '123'
    };

    let productObj = await Products.createProduct(args);

    expect(productObj).toBeDefined();
    expect(productObj.name).toEqual(product.name);
    expect(productObj.type).toEqual(product.type);
    expect(productObj.description).toEqual(product.description);
    expect(productObj.sku).toEqual(product.sku);

    // testing product category
    args.categoryCode = productCategory.code;
    args.code = '234';
    productObj = await Products.createProduct(args);

    // testing product vendor
    args.vendorCode = (await companyFactory({ code: '1234' })).code;
    args.code = '2345';
    productObj = await Products.createProduct(args);

    expect(productObj.categoryId).toBe(productCategory._id);
  });

  test('Update product', async () => {
    const args: any = {
      name: `${product.name}-update`,
      type: `${product.type}-update`,
      description: `${product.description}-update`,
      sku: `${product.sku}-update`,
      categoryId: productCategory._id,
      code: '321'
    };

    let productObj = await Products.updateProduct(product._id, args);

    expect(productObj).toBeDefined();
    expect(productObj.name).toEqual(`${product.name}-update`);
    expect(productObj.type).toEqual(`${product.type}-update`);
    expect(productObj.description).toEqual(`${product.description}-update`);
    expect(productObj.sku).toEqual(`${product.sku}-update`);

    // testing custom field data
    const field1 = await fieldFactory({
      contentType: 'product',
      contentTypeId: product._id,
      validation: 'number'
    });
    const field2 = await fieldFactory({
      contentType: 'product',
      contentTypeId: product._id,
      validation: 'date'
    });

    args.customFieldsData = [
      { field: field1._id, value: 10 },
      { field: field2._id, value: '2011-01-01' }
    ];

    productObj = await Products.updateProduct(product._id, args);

    if (productObj.customFieldsData) {
      expect(productObj.customFieldsData[0].value).toBe(10);
    }
  });

  test('Update product (Error: Code must be unique)', async () => {
    const temp = await productFactory();

    const args: any = {
      name: `${product.name}-update`,
      type: `${product.type}-update`,
      description: `${product.description}-update`,
      sku: `${product.sku}-update`,
      categoryId: productCategory._id,
      code: temp.code
    };

    try {
      await Products.updateProduct(product._id, args);
    } catch (e) {
      expect(e.message).toBe('Code must be unique');
    }
  });

  test('Remove products and update status', async () => {
    expect.assertions(1);

    await Deals.updateOne(
      { _id: deal._id },
      { $set: { productsData: [{ productId: product._id }] } }
    );

    await Products.removeProducts([product._id]);

    const removedProduct = await Products.getProduct({ _id: product._id });

    expect(removedProduct.status).toEqual(PRODUCT_STATUSES.DELETED);
  });

  test('Remove product', async () => {
    await Deals.updateOne({ _id: deal._id }, { $set: { productsData: [] } });
    await Deals.updateOne({ _id: deal2._id }, { $set: { productsData: [] } });

    const isDeleted = await Products.removeProducts([product._id]);

    expect(isDeleted).toBeTruthy();
  });

  test('Merge products', async () => {
    const args: any = {
      name: product.name,
      type: product.type,
      description: product.description,
      sku: product.sku,
      categoryId: productCategory._id,
      unitPrice: 12345
    };

    try {
      await Products.mergeProducts([product._id], args);
    } catch (e) {
      expect(e.message).toBe(`Can not merge products. Must choose code field.`);
    }

    const product1 = await productFactory({ categoryId: productCategory._id });
    const product2 = await productFactory({ categoryId: productCategory._id });

    const productIds = [product1._id, product2._id];

    const deal1 = await dealFactory({
      productsData: [{ productId: product1._id }]
    });

    const deal3 = await dealFactory({
      productsData: [{ productId: product2._id }]
    });

    args.code = 'test code';

    const updatedProduct = await Products.mergeProducts(productIds, args);

    const updatedDeal = await Deals.findOne({
      _id: deal1._id
    }).distinct('productsData.productId');

    const updatedDeal2 = await Deals.findOne({
      _id: deal3._id
    }).distinct('productsData.productId');

    expect(updatedProduct.name).toBe(args.name);

    expect(updatedProduct._id).toBe(updatedDeal[0]);
    expect(updatedProduct._id).toBe(updatedDeal2[0]);
  });

  test('Get product category', async () => {
    try {
      await ProductCategories.getProductCatogery({ _id: 'fakeId' });
    } catch (e) {
      expect(e.message).toBe('Product & service category not found');
    }

    const response = await ProductCategories.getProductCatogery({
      _id: productCategory._id
    });

    expect(response).toBeDefined();
  });

  test('Create product category', async () => {
    const doc: any = {
      name: 'Product name',
      code: 'create1234'
    };

    let response = await ProductCategories.createProductCategory(doc);

    expect(response.name).toBe(doc.name);
    expect(response.code).toBe(doc.code);

    // if parentId
    doc.parentId = productCategory._id;
    doc.code = 'create12345';

    response = await ProductCategories.createProductCategory(doc);

    expect(response.parentId).toBe(productCategory._id);
  });

  test('Update product category (Error: Cannot change category)', async () => {
    const parentCategory = await productCategoryFactory({
      parentId: productCategory._id
    });

    const doc: any = {
      name: 'Updated product name',
      code: 'error1234',
      parentId: parentCategory._id
    };

    try {
      await ProductCategories.updateProductCategory(productCategory._id, doc);
    } catch (e) {
      expect(e.message).toBe('Cannot change category');
    }
  });

  test('Update product category (Error: Code must be unique)', async () => {
    const temp = await productCategoryFactory();

    const doc: any = {
      name: 'Updated product name',
      code: temp.code
    };

    try {
      await ProductCategories.updateProductCategory(productCategory._id, doc);
    } catch (e) {
      expect(e.message).toBe('Code must be unique');
    }
  });

  test('Update product category', async () => {
    const doc: any = {
      name: 'Updated product name',
      code: 'update1234'
    };

    let response = await ProductCategories.updateProductCategory(
      productCategory._id,
      doc
    );

    expect(response.name).toBe(doc.name);
    expect(response.code).toBe(doc.code);

    // add child category
    const childCategory = await ProductCategories.createProductCategory({
      name: 'name',
      code: 'create123456',
      parentId: productCategory._id,
      order: 'order'
    });

    response = await ProductCategories.updateProductCategory(
      productCategory._id,
      doc
    );

    expect(childCategory.order).toBe(
      `${response.order}/${childCategory.name}${childCategory.code}`
    );
  });

  test('Remove product category', async () => {
    await ProductCategories.removeProductCategory(productCategory._id);

    expect(await ProductCategories.find().countDocuments()).toBe(0);
  });

  test('Remove product category (Error: Can`t remove a product category)', async () => {
    await productFactory({ categoryId: productCategory._id });
    await productFactory({ categoryId: productCategory._id });

    try {
      await ProductCategories.removeProductCategory(productCategory._id);
    } catch (e) {
      expect(e.message).toBe("Can't remove a product category");
    }
  });
});
