import * as faker from 'faker';
import { graphqlRequest } from '../db/connection';
import { productTemplateFactory } from '../db/factories';
import { Forms, ProductTemplates } from '../db/models';
// import { getUniqueValue } from '../db/factories';

import './setup.ts';

/*
 * Generate test data
 */

describe('ProductTemplates mutations', async () => {
  let productTemplate;

  const productTemplateParamsDef = `
  $type: String
  $title: String
  $discount: Float
  $totalAmount: Float
  $description: String
  $templateItems: JSON
  $status: String
`;

  const productTemplateParams = `
  type: $type
  title: $title
  discount: $discount
  totalAmount: $totalAmount
  description: $description
  templateItems: $templateItems
  status: $status
`;

  const commonReturn = `
    _id
    title
    discount
    totalAmount
    description
    templateItems 
    status
  `;

  const args = {
    type: 'productService',
    title: faker.random.word(),
    discount: faker.random.number(),
    totalAmount: faker.random.number(),
    description: faker.random.word(),
    templateItems: [
      {
        _id: Math.random().toString(),
        categoryId: Math.random().toString(),
        itemId: Math.random().toString(),
        unitPrice: faker.random.number(),
        quantity: 1,
        discount: 0
      }
    ],
    status: 'active'
  };

  beforeEach(async () => {
    // Creating test data
    productTemplate = await productTemplateFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await ProductTemplates.deleteMany({});
    await Forms.deleteMany({});
  });

  test('Add productTemplate', async () => {
    const mutation = `
    mutation productTemplatesAdd(${productTemplateParamsDef}) {
      productTemplatesAdd(${productTemplateParams}) {
        ${commonReturn}
      }
    }
    `;

    const created = await graphqlRequest(mutation, 'productTemplatesAdd', args);

    expect(created.description).toBe(args.description);
    expect(created.discount).toBe(args.discount);
    expect(created.totalAmount).toBe(args.totalAmount);
    expect(created.templateItems.length).toBe(args.templateItems.length);
  });

  test('Duplicate productTemplate', async () => {
    const mutation = `
    mutation productTemplatesDuplicate($_id: String!) {
      productTemplatesDuplicate(_id: $_id) {
        ${commonReturn}
      }
    }
    `;

    const duplicated = await graphqlRequest(
      mutation,
      'productTemplatesDuplicate',
      { _id: productTemplate._id }
    );

    expect(duplicated.title).toBe(productTemplate.title + ' copied');
    expect(duplicated.description).toBe(productTemplate.description);
    expect(duplicated.discount).toBe(productTemplate.discount);
    expect(duplicated.totalAmount).toBe(productTemplate.totalAmount);
    expect(duplicated.templateItems.length).toBe(
      productTemplate.templateItems.length
    );
  });

  test('Change status productTemplate', async () => {
    const mutation = `
    mutation productTemplatesChangeStatus($_id: String!, $status: String) {
      productTemplatesChangeStatus(_id: $_id, status: $status) {
        ${commonReturn}
      }
    }
    `;

    const changed = await graphqlRequest(
      mutation,
      'productTemplatesChangeStatus',
      { _id: productTemplate._id, status: 'new status' }
    );

    expect(changed.title).toBe(productTemplate.title);
    expect(changed.status).toBe('new status');
  });

  test('Edit productTemplate', async () => {
    const mutation = `
    mutation productTemplatesEdit($_id: String!, ${productTemplateParamsDef}) {
      productTemplatesEdit(_id: $_id, ${productTemplateParams}) {
        ${commonReturn}
      }
    }
    `;

    const edited = await graphqlRequest(mutation, 'productTemplatesEdit', {
      _id: productTemplate._id,
      ...args
    });

    expect(edited._id).toBe(productTemplate._id);
    expect(edited.title).toBe(args.title);
    expect(edited.description).toBe(args.description);
    expect(edited.templateItems.length).toBe(args.templateItems.length);
  });

  test('Remove productTemplate', async () => {
    const mutation = `
      mutation productTemplatesRemove($ids: [String!]) {
        productTemplatesRemove(ids: $ids)
      }
    `;

    await graphqlRequest(mutation, 'productTemplatesRemove', {
      ids: [productTemplate._id]
    });

    expect(
      await ProductTemplates.find({ _id: { $in: [productTemplate._id] } })
    ).toEqual([]);
  });
});
