import {
  productTemplateFactory,
  boardFactory,
  dealFactory,
  pipelineFactory,
  pipelineLabelFactory,
  stageFactory,
  userFactory
} from '../db/factories';
import { ProductTemplates } from '../db/models';
import { IProductTemplateDocument } from '../db/models/definitions/productTemplates';
import { IDealDocument } from '../db/models/definitions/deals';
import * as faker from 'faker';

import './setup.ts';

describe('Test product template model', () => {
  let productTemplate: IProductTemplateDocument;
  let productTemplateCheckUsed: IProductTemplateDocument;
  let deal: IDealDocument;

  beforeEach(async () => {
    // Creating test data
    productTemplate = await productTemplateFactory();
    productTemplateCheckUsed = await productTemplateFactory();
    const board = await boardFactory();
    const pipeline = await pipelineFactory({ boardId: board._id });
    const stage = await stageFactory({ pipelineId: pipeline._id });
    const user = await userFactory({});
    const secondUser = await userFactory({});
    const label = await pipelineLabelFactory({});
    deal = await dealFactory({
      initialStageId: stage._id,
      stageId: stage._id,
      userId: user._id,
      modifiedBy: user._id,
      labelIds: [label._id],
      assignedUserIds: [user._id],
      watchedUserIds: [secondUser._id],
      productsData: [{ templateId: productTemplateCheckUsed._id }]
    });
  });

  afterEach(async () => {
    // Clearing test data
    await ProductTemplates.deleteMany({});
  });

  test('Get product template', async () => {
    try {
      await ProductTemplates.getProductTemplate({ _id: 'fakeId' });
    } catch (e) {
      expect(e.message).toBe('Product template not found');
    }

    const response = await ProductTemplates.getProductTemplate({
      _id: productTemplate._id
    });

    expect(response).toBeDefined();
  });

  // Test deal product template
  test('Create product template', async () => {
    const created = await ProductTemplates.createProductTemplate({
      type: productTemplate.type,
      title: faker.random.word(),
      discount: productTemplate.discount,
      totalAmount: productTemplate.totalAmount,
      description: productTemplate.description,
      templateItems: productTemplate.templateItems,
      status: productTemplate.status,
      updatedAt: productTemplate.updatedAt,
      updatedBy: productTemplate.updatedBy,
      createdAt: productTemplate.createdAt,
      createdBy: productTemplate.createdBy
    });

    expect(created).toBeDefined();
    expect(created.discount).toEqual(productTemplate.discount);
    expect(created.totalAmount).toEqual(productTemplate.totalAmount);
    expect(created.templateItems.length).toEqual(
      productTemplate.templateItems.length
    );
  });

  test('Update product template', async () => {
    const title = 'Updated name';
    const description = 'Updated description';
    const discount = 5;
    const totalAmount = 5500;
    const templateItems = [];
    const type = 'productService';
    const status = 'archieved';
    const updatedAt = new Date();
    const updatedBy = 'test';
    const createdAt = new Date();
    const createdBy = 'test';

    const updated = await ProductTemplates.updateProductTemplate(
      productTemplate._id,
      {
        type,
        title,
        discount,
        totalAmount,
        description,
        templateItems,
        status,
        updatedAt,
        updatedBy,
        createdAt,
        createdBy
      }
    );

    expect(updated).toBeDefined();
    expect(updated.title).toEqual(title);
    expect(updated.description).toEqual(description);
    expect(updated.discount).toEqual(discount);
    expect(updated.totalAmount).toEqual(totalAmount);
  });

  test('Remove product template', async () => {
    const isDeleted = await ProductTemplates.removeProductTemplate([
      productTemplate._id
    ]);

    expect(isDeleted).toBeTruthy();
  });

  test('Used product template', async () => {
    try {
      await ProductTemplates.checkUsedOnDeal([productTemplateCheckUsed._id]);
    } catch (e) {
      expect(e.message).toBe(
        `You cannnot remove it, because it was used in ${deal.name}`
      );
    }
  });

  test('Duplicate product template', async () => {
    try {
      await ProductTemplates.checkDuplication(productTemplate.title);
    } catch (e) {
      expect(e.message).toBe('Title must be unique');
    }
  });

  test(`Remove product Error('product template not found')`, async () => {
    expect.assertions(1);

    const fakeId = 'fakeId';

    const isDeleted = await ProductTemplates.removeProductTemplate([fakeId]);
    expect(isDeleted).toBeTruthy();
  });
});
