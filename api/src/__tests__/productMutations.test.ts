import { graphqlRequest } from '../db/connection';
import {
  productCategoryFactory,
  productFactory,
  tagsFactory,
  attachmentFactory
} from '../db/factories';
import { ProductCategories, Products, Tags } from '../db/models';

import './setup.ts';

describe('Test products mutations', () => {
  let product;
  let productCategory;
  let parentCategory;

  const commonParamDefs = `
    $name: String!,
    $type: String!,
    $description: String,
    $categoryId: String,
    $sku: String
    $code: String
    $attachment: AttachmentInput
    $attachmentMore: [AttachmentInput]
    $productCount: Int
    $minimiumCount: Int
  `;

  const commonParams = `
    name: $name
    type: $type
    description: $description,
    categoryId: $categoryId
    sku: $sku
    code: $code
    attachment: $attachment
    attachmentMore: $attachmentMore
    productCount: $productCount
    minimiumCount: $minimiumCount
  `;

  const commonCategoryParamDefs = `
    $name: String!,
    $code: String!,
    $description: String,
    $parentId: String,
    $attachment: AttachmentInput,    
    $status: String
  `;

  const commonCategoryParams = `
    name: $name,
    code: $code,
    description: $description,
    parentId: $parentId,
    attachment: $attachment,
    status: $status
  `;

  beforeEach(async () => {
    // Creating test data
    parentCategory = await productCategoryFactory();
    productCategory = await productCategoryFactory({
      parentId: parentCategory._id
    });

    const tag = await tagsFactory();

    product = await productFactory({
      type: 'product',
      categoryId: productCategory._id,
      tagIds: [tag._id]
    });
  });

  afterEach(async () => {
    // Clearing test data
    await Products.deleteMany({});
    await ProductCategories.deleteMany({});
    await Tags.deleteMany({});
  });

  test('Create product', async () => {
    const args = {
      name: product.name,
      type: product.type,
      sku: product.sku,
      description: product.description,
      categoryId: productCategory._id,
      code: '123'
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
          attachment {
            url
            name
            type
            size
          }
        }
      }
    `;

    const createdProduct = await graphqlRequest(mutation, 'productsAdd', args);

    expect(createdProduct.name).toEqual(args.name);
    expect(createdProduct.type).toEqual(args.type);
    expect(createdProduct.description).toEqual(args.description);
    expect(createdProduct.sku).toEqual(args.sku);
    expect(createdProduct.code).toEqual(args.code);
  });

  test('Update product', async () => {
    const category2 = await productCategoryFactory();

    const args = {
      _id: product._id,
      name: product.name,
      type: product.type,
      sku: product.sku,
      description: product.description,
      code: product.code,
      categoryId: category2._id
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
          attachment {
            url
            name
            type
            size
          }
        }
      }
    `;

    const updatedProduct = await graphqlRequest(mutation, 'productsEdit', args);

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

    await graphqlRequest(mutation, 'productsRemove', {
      productIds: [product._id]
    });

    expect(await Products.findOne({ _id: product._id })).toBe(null);
  });

  test('Create product category', async () => {
    const args = {
      name: productCategory.name,
      code: '123',
      description: productCategory.description,
      parentId: productCategory._id
    };

    const mutation = `
      mutation productCategoriesAdd(${commonCategoryParamDefs}) {
        productCategoriesAdd(${commonCategoryParams}) {
          _id
          name
          code
          description
          parentId
        }
      }
    `;

    const createdProduct = await graphqlRequest(
      mutation,
      'productCategoriesAdd',
      args
    );

    expect(createdProduct.name).toEqual(args.name);
    expect(createdProduct.code).toEqual(args.code);
    expect(createdProduct.description).toEqual(args.description);
    expect(createdProduct.parentId).toEqual(args.parentId);
  });

  test('Update product category', async () => {
    const secondParent = await productCategoryFactory();

    const args = {
      _id: productCategory._id,
      name: 'updated',
      code: 'updatedCode',
      parentId: secondParent._id
    };

    const mutation = `
      mutation productCategoriesEdit($_id: String!, ${commonCategoryParamDefs}) {
        productCategoriesEdit(_id: $_id, ${commonCategoryParams}) {
          _id
          name
          code
          description
          parentId
        }
      }
    `;

    const updatedProductCategory = await graphqlRequest(
      mutation,
      'productCategoriesEdit',
      args
    );

    expect(updatedProductCategory._id).toEqual(args._id);
    expect(updatedProductCategory.name).toEqual(args.name);
    expect(updatedProductCategory.code).toEqual(args.code);
  });

  test('Remove product category', async () => {
    const mutation = `
      mutation productCategoriesRemove($_id: String!) {
        productCategoriesRemove(_id: $_id)
      }
    `;

    // remove product before the category
    await Products.deleteMany({ categoryId: productCategory._id });

    await graphqlRequest(mutation, 'productCategoriesRemove', {
      _id: productCategory._id
    });

    expect(await ProductCategories.findOne({ _id: productCategory._id })).toBe(
      null
    );
  });

  test('Merge product', async () => {
    const args = {
      productIds: [product._id],
      productFields: {
        name: product.name,
        unitPrice: '123',
        categoryId: productCategory._id,
        type: product.type,
        code: product.code
      }
    };

    const mutation = `
      mutation productsMerge($productIds: [String], $productFields: JSON) {
        productsMerge(productIds: $productIds, productFields: $productFields) {
          _id
          name
          code
          unitPrice
          categoryId
          type
        }
      }   
    `;

    const product1 = await graphqlRequest(mutation, 'productsMerge', args);

    expect(product1.code).toBe(args.productFields.code);
  });

  test('Select feature', async () => {
    const attachment = attachmentFactory();
    const attachment1 = attachmentFactory();
    const attachmentMore = [attachment, attachment1];

    const withAttachmentProduct = await productFactory({
      attachmentMore
    });

    const args = {
      _id: withAttachmentProduct._id,
      counter: '0'
    };

    const mutation = `
      mutation productSelectFeature($_id: String, $counter: String) {
        productSelectFeature(_id: $_id, counter: $counter) {
          name
          code
          _id
        }
      }   
    `;

    const product1 = await graphqlRequest(
      mutation,
      'productSelectFeature',
      args
    );

    expect(product1._id).toBe(args._id);
  });
});
