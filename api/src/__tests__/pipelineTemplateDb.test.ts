import * as faker from 'faker';
import { formFactory, pipelineTemplateFactory } from '../db/factories';
import { PipelineTemplates } from '../db/models';
import { IPipelineTemplateDocument, IPipelineTemplateStage } from '../db/models/definitions/pipelineTemplates';

import './setup.ts';

describe('Test pipeline template model', () => {
  let pipelineTemplate: IPipelineTemplateDocument;
  const stages: IPipelineTemplateStage[] = [
    { _id: Math.random().toString(), name: faker.random.word(), formId: faker.random.word() },
    { _id: Math.random().toString(), name: faker.random.word(), formId: faker.random.word() },
  ];

  beforeEach(async () => {
    // Creating test data
    pipelineTemplate = await pipelineTemplateFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await PipelineTemplates.deleteMany({});
  });

  test('Get pipeline template', async () => {
    try {
      await PipelineTemplates.getPipelineTemplate('fakeId');
    } catch (e) {
      expect(e.message).toBe('Pipeline template not found');
    }

    const response = await PipelineTemplates.getPipelineTemplate(pipelineTemplate._id);

    expect(response).toBeDefined();
  });

  // Test deal pipeline template
  test('Create pipeline template', async () => {
    const created = await PipelineTemplates.createPipelineTemplate(
      {
        name: pipelineTemplate.name,
        description: pipelineTemplate.description || '',
        type: pipelineTemplate.type,
      },
      stages,
    );

    expect(created).toBeDefined();
    expect(created.name).toEqual(pipelineTemplate.name);
    expect(created.description).toEqual(pipelineTemplate.description);
    expect(created.type).toEqual(pipelineTemplate.type);
    expect(created.stages.length).toEqual(pipelineTemplate.stages.length);
  });

  test('Update pipeline template', async () => {
    const name = 'Updated name';
    const description = 'Updated description';
    const type = 'Updated type';

    const updated = await PipelineTemplates.updatePipelineTemplate(
      pipelineTemplate._id,
      {
        name,
        description,
        type,
      },
      stages,
    );

    expect(updated).toBeDefined();
    expect(updated.name).toEqual(name);
    expect(updated.description).toEqual(description);
    expect(updated.type).toEqual(type);
    expect(updated.stages.length).toEqual(pipelineTemplate.stages.length);
  });

  test(`Duplicate pipeline template Error('pipeline template not found')`, async () => {
    try {
      await PipelineTemplates.duplicatePipelineTemplate('fakeId');
    } catch (e) {
      expect(e.message).toBe('Pipeline template not found');
    }
  });

  test('Duplicate pipeline template', async () => {
    const form1 = await formFactory();
    const form2 = await formFactory();

    // Creating test data
    const template = await pipelineTemplateFactory({
      stages: [{ name: 'stage 1', formId: form1._id }, { name: 'stage 2', formId: form2._id }],
    });

    const duplicated = await PipelineTemplates.duplicatePipelineTemplate(template._id);

    expect(duplicated).toBeDefined();
    expect(duplicated.description).toEqual(template.description);
    expect(duplicated.type).toEqual(template.type);
    expect(duplicated.stages[0].name).toBe('stage 1');
    expect(duplicated.stages[1].name).toBe('stage 2');
  });

  test('Remove pipeline template', async () => {
    const isDeleted = await PipelineTemplates.removePipelineTemplate(pipelineTemplate._id);

    expect(isDeleted).toBeTruthy();
  });

  test(`Remove pipeline Error('pipeline template not found')`, async () => {
    expect.assertions(1);

    const fakeId = 'fakeId';

    try {
      await PipelineTemplates.removePipelineTemplate(fakeId);
    } catch (e) {
      expect(e.message).toEqual('Pipeline template not found');
    }
  });
});
