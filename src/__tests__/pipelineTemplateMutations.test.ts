import * as faker from 'faker';
import { graphqlRequest } from '../db/connection';
import { formFactory, pipelineTemplateFactory } from '../db/factories';
import { Forms, PipelineTemplates } from '../db/models';

import { BOARD_TYPES } from '../db/models/definitions/constants';
import './setup.ts';

/*
 * Generate test data
 */

describe('PipelineTemplates mutations', () => {
  let pipelineTemplate;

  const commonParamDefs = `
    $name: String!
    $description: String
    $type: String!
    $stages: [PipelineTemplateStageInput]
  `;

  const commonParams = `
    name: $name
    description: $description
    type: $type
    stages: $stages
  `;

  const commonReturn = `
    name
    description
    type
    stages {
      name
      formId
      order
    }
  `;

  const args = {
    name: faker.name.findName(),
    description: faker.random.word(),
    type: BOARD_TYPES.GROWTH_HACK,
    stages: [
      { _id: Math.random().toString(), name: 'Stage 1', formId: 'formId1' },
      { _id: Math.random().toString(), name: 'Stage 2', formId: 'formId2' },
      { _id: Math.random().toString(), name: 'Stage 3', formId: 'formId3' },
      { _id: Math.random().toString(), name: 'Stage 4', formId: 'formId4' },
    ],
  };

  beforeEach(async () => {
    // Creating test data
    pipelineTemplate = await pipelineTemplateFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await PipelineTemplates.deleteMany({});
    await Forms.deleteMany({});
  });

  test('Add pipelineTemplate', async () => {
    const mutation = `
      mutation pipelineTemplatesAdd(${commonParamDefs}){
        pipelineTemplatesAdd(${commonParams}) {
          ${commonReturn}
        }
      }
    `;

    const created = await graphqlRequest(mutation, 'pipelineTemplatesAdd', args);

    expect(created.name).toBe(args.name);
    expect(created.description).toBe(args.description);
    expect(created.type).toBe(args.type);

    expect(created.stages[0].formId).toBe('formId1');
    expect(created.stages[1].formId).toBe('formId2');
    expect(created.stages[2].formId).toBe('formId3');
    expect(created.stages[3].formId).toBe('formId4');
  });

  test('Edit pipelineTemplate', async () => {
    const mutation = `
      mutation pipelineTemplatesEdit($_id: String! ${commonParamDefs}){
        pipelineTemplatesEdit(_id: $_id ${commonParams}) {
          _id
          ${commonReturn}
        }
      }
    `;

    const edited = await graphqlRequest(mutation, 'pipelineTemplatesEdit', { _id: pipelineTemplate._id, ...args });

    expect(edited._id).toBe(pipelineTemplate._id);
    expect(edited.name).toBe(args.name);
    expect(edited.type).toBe(args.type);
    expect(edited.description).toBe(args.description);
    expect(edited.stages.length).toBe(args.stages.length);
  });

  test('Remove pipelineTemplate', async () => {
    const mutation = `
      mutation pipelineTemplatesRemove($_id: String!) {
        pipelineTemplatesRemove(_id: $_id)
      }
    `;

    await graphqlRequest(mutation, 'pipelineTemplatesRemove', { _id: pipelineTemplate._id });

    expect(await PipelineTemplates.find({ _id: { $in: [pipelineTemplate._id] } })).toEqual([]);
  });

  test('Duplicate pipelineTemplate', async () => {
    const mutation = `
      mutation pipelineTemplatesDuplicate($_id: String!) {
        pipelineTemplatesDuplicate(_id: $_id) {
          _id
          name
          description
          stages {
            name
            formId
          }
        }
      }
    `;

    const form1 = await formFactory();
    const form2 = await formFactory();

    // Creating test data
    const template = await pipelineTemplateFactory({
      stages: [{ name: 'stage 1', formId: form1._id }, { name: 'stage 2', formId: form2._id }],
    });

    const duplicated = await graphqlRequest(mutation, 'pipelineTemplatesDuplicate', { _id: template._id });

    expect(duplicated.description).toBe(template.description);
    expect(duplicated.stages[0].name).toBe('stage 1');
    expect(duplicated.stages[1].name).toBe('stage 2');
  });
});
