import { graphqlRequest } from '../db/connection';
import {
  companyFactory,
  productCategoryFactory,
  productFactory,
  tagsFactory
} from '../db/factories';
import { ProductCategories, Products } from '../db/models';
import { PRODUCT_TYPES, TAG_TYPES } from '../db/models/definitions/constants';

import './setup.ts';

describe('productQueries', () => {
  afterEach(async () => {
    // Clearing test data
    await Products.deleteMany({});
    await ProductCategories.deleteMany({});
  });

  test('Products', async () => {
    const category = await productCategoryFactory({ code: '1' });
    const tag = await tagsFactory({ type: TAG_TYPES.PRODUCT });

    const product = await productFactory({
      categoryId: category._id,
      type: PRODUCT_TYPES.PRODUCT
    });
    await productFactory({
      categoryId: category._id,
      type: PRODUCT_TYPES.SERVICE
    });
    await productFactory({ tagIds: [tag._id], type: PRODUCT_TYPES.SERVICE });

    const qry = `
      query products($page: Int $perPage: Int $type: String $categoryId: String $ids: [String] $tag: String $searchValue: String) {
        products(page: $page perPage: $perPage type: $type categoryId: $categoryId ids: $ids tag: $tag searchValue: $searchValue) {
          _id
          name
          type
          description
          sku
          createdAt
          attachment {
            name
            url
            type
            size
          }
          attachmentMore {
            name
            url
            type
            size
          }
          productCount
          minimiumCount
        }
      }
    `;

    let response = await graphqlRequest(qry, 'products', {
      page: 1,
      perPage: 2
    });

    expect(response.length).toBe(2);

    response = await graphqlRequest(qry, 'products', {
      type: PRODUCT_TYPES.PRODUCT
    });

    expect(response.length).toBe(1);

    response = await graphqlRequest(qry, 'products', {
      categoryId: category._id
    });

    expect(response.length).toBe(2);

    response = await graphqlRequest(qry, 'products', { ids: [product._id] });

    expect(response[0]._id).toBe(product._id);

    response = await graphqlRequest(qry, 'products', { tag: tag._id });

    expect(response.length).toBe(1);

    response = await graphqlRequest(qry, 'products', {
      searchValue: product.name
    });

    expect(response[0].name).toBe(product.name);
  });

  test('Products total count', async () => {
    await productFactory({ type: PRODUCT_TYPES.PRODUCT });
    await productFactory({ type: PRODUCT_TYPES.SERVICE });
    await productFactory({ type: PRODUCT_TYPES.PRODUCT });

    const qry = `
      query productsTotalCount($type: String) {
        productsTotalCount(type: $type)
      }
    `;

    const args = { type: PRODUCT_TYPES.PRODUCT };

    let response = await graphqlRequest(qry, 'productsTotalCount', args);

    expect(response).toBe(2);

    response = await graphqlRequest(qry, 'productsTotalCount');

    expect(response).toBe(3);
  });

  test('Product categories', async () => {
    const parent = await productCategoryFactory({ code: '1' });
    await productCategoryFactory({ parentId: parent._id, code: '2' });
    await productCategoryFactory({ parentId: parent._id, code: '3' });

    const qry = `
      query productCategories($parentId: String $searchValue: String) {
        productCategories(parentId: $parentId searchValue: $searchValue) {
          _id
          name
          parentId
          attachment {
            name
            url
            type
            size
          }
          isRoot
          productCount
        }
      }
    `;

    let response = await graphqlRequest(qry, 'productCategories');

    expect(response.length).toBe(3);

    response = await graphqlRequest(qry, 'productCategories', {
      parentId: parent._id
    });

    expect(response.length).toBe(2);

    response = await graphqlRequest(qry, 'productCategories', {
      searchValue: parent.name
    });

    expect(response[0].name).toBe(parent.name);
  });

  test('Product categories total count', async () => {
    await productCategoryFactory();
    await productCategoryFactory();
    await productCategoryFactory();
    await productCategoryFactory();

    const qry = `
      query productCategoriesTotalCount {
        productCategoriesTotalCount
      }
    `;

    const totalCount = await graphqlRequest(qry, 'productCategoriesTotalCount');

    expect(totalCount).toBe(4);
  });

  test('Product detail', async () => {
    const qry = `
      query productDetail($_id: String!) {
        productDetail(_id: $_id) {
          _id
          category { _id }
          getTags { _id }
          vendor { _id }
        }
      }
    `;

    const product = await productFactory({
      vendorId: (await companyFactory())._id
    });

    const response = await graphqlRequest(qry, 'productDetail', {
      _id: product._id
    });

    expect(response._id).toBe(product._id);
  });

  test('Product category detail', async () => {
    const qry = `
      query productCategoryDetail($_id: String!) {
        productCategoryDetail(_id: $_id) {
          _id
        }
      }
    `;

    const productCategory = await productCategoryFactory();

    const response = await graphqlRequest(qry, 'productCategoryDetail', {
      _id: productCategory._id
    });

    expect(response._id).toBe(productCategory._id);
  });

  test('Product count by tag', async () => {
    const tag1 = await tagsFactory({ type: TAG_TYPES.PRODUCT });
    const tag2 = await tagsFactory({ type: TAG_TYPES.PRODUCT });

    const qry = `
      query productCountByTags {
        productCountByTags
      }
    `;

    await productFactory({ tagIds: [tag1._id, tag2._id] });
    await productFactory({ tagIds: [tag2._id] });
    await productFactory({ tagIds: [tag1._id, tag2._id] });

    const response = await graphqlRequest(qry, 'productCountByTags');

    expect(response[tag1._id]).toBe(2);
    expect(response[tag2._id]).toBe(3);
  });
});
