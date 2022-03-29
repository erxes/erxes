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
  let productTemplate2: IProductTemplateDocument;
  let productTemplateCheckUsed: IProductTemplateDocument;
  let deal: IDealDocument;

  beforeEach(async () => {
    // Creating test data
    productTemplate = await productTemplateFactory();
    productTemplate2 = await productTemplateFactory();
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

    const template2 = await ProductTemplates.createProductTemplate({
      type,
      title: 'Updated name 3',
      discount,
      totalAmount,
      description,
      templateItems,
      status,
      parentId: updated._id,
      updatedAt,
      updatedBy,
      createdAt,
      createdBy
    });

    let parentTemplate = await ProductTemplates.findOne({
      _id: updated._id
    }).lean();

    expect(template2.order).toEqual(
      `${parentTemplate.order}/${template2.title}`
    );
    expect(parentTemplate.relatedIds).toEqual([template2._id]);

    const template3 = await ProductTemplates.createProductTemplate({
      type,
      title: 'Updated name 4',
      discount,
      totalAmount,
      description,
      templateItems,
      status,
      parentId: template2._id,
      updatedAt,
      updatedBy,
      createdAt,
      createdBy
    });

    expect(template3.order).toEqual(`${template2.order}/${template3.title}`);

    const updatedTemplate2 = await ProductTemplates.findOne({
      _id: template2._id
    }).lean();
    expect(updatedTemplate2.relatedIds).toEqual([template3._id]);

    parentTemplate = await ProductTemplates.findOne({
      _id: updated._id
    }).lean();
    expect(parentTemplate.relatedIds).toEqual([template3._id, template2._id]);
    expect(parentTemplate).toBeTruthy();
    expect(parentTemplate.order).toBeTruthy();

    const newTemplate = await productTemplateFactory({});

    await ProductTemplates.updateProductTemplate(template2._id, {
      title: 'change parent template',
      type,
      discount,
      totalAmount,
      description,
      templateItems,
      status,
      parentId: newTemplate._id,
      updatedAt,
      updatedBy,
      createdAt,
      createdBy
    });

    parentTemplate = await ProductTemplates.findOne({
      _id: updated._id
    }).lean();
    expect(parentTemplate.relatedIds.length).toEqual(0);
  });

  test('Remove product template', async () => {
    const isDeleted = await ProductTemplates.removeProductTemplate([
      productTemplate._id
    ]);

    expect(isDeleted).toBeTruthy();
  });

  test('Update template check duplicated', async () => {
    const title = 'Updated name1';
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

    try {
      const childTag = await productTemplateFactory({
        parentId: productTemplate2._id
      });

      await ProductTemplates.updateProductTemplate(productTemplate2._id, {
        type,
        title,
        discount,
        totalAmount,
        description,
        templateItems,
        status,
        parentId: childTag._id,
        updatedAt,
        updatedBy,
        createdAt,
        createdBy
      });
    } catch (e) {
      expect(e.message).toEqual('Cannot change template');
    }
  });

  test('Remove template with child', async () => {
    const title = 'Updated name2';
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

    expect.assertions(1);

    try {
      await ProductTemplates.createProductTemplate({
        type,
        title,
        discount,
        totalAmount,
        description,
        templateItems,
        status,
        parentId: productTemplate._id,
        updatedAt,
        updatedBy,
        createdAt,
        createdBy
      });

      await ProductTemplates.removeProductTemplate([productTemplate._id]);
    } catch (e) {
      expect(e.message).toEqual('Please remove child templates first');
    }
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

    const isDeleted = await ProductTemplates.removeProductTemplate([
      productTemplate._id
    ]);
    expect(isDeleted).toBeTruthy();
  });
});
