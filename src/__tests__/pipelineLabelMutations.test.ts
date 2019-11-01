import * as faker from 'faker';
import { graphqlRequest } from '../db/connection';
import { pipelineFactory, pipelineLabelFactory } from '../db/factories';
import { PipelineLabels, Pipelines } from '../db/models';

import './setup.ts';

/*
 * Generate test data
 */

describe('PipelineLabels mutations', () => {
  let pipelineLabel;

  const commonParamDefs = `
    $name: String!
    $pipelineId: String!
    $colorCode: String!
  `;

  const commonParams = `
    name: $name
    pipelineId: $pipelineId
    colorCode: $colorCode
  `;

  const commonReturn = `
    name
    pipelineId
    colorCode
  `;

  const args = {
    name: faker.name.findName(),
    pipelineId: faker.random.word(),
    colorCode: faker.random.word(),
  };

  beforeEach(async () => {

    const pipeline = await pipelineFactory();
    pipelineLabel = await pipelineLabelFactory({ pipelineId: pipeline._id });
  });

  afterEach(async () => {
    // Clearing test data
    await PipelineLabels.deleteMany({});
    await Pipelines.deleteMany({});
  });

  test('Add pipelineLabel', async () => {
    const mutation = `
      mutation pipelineLabelsAdd(${commonParamDefs}){
        pipelineLabelsAdd(${commonParams}) {
          ${commonReturn}
        }
      }
    `;

    const created = await graphqlRequest(mutation, 'pipelineLabelsAdd', args);

    expect(created.name).toBe(args.name);
    expect(created.pipelineId).toBe(args.pipelineId);
    expect(created.colorCode).toBe(args.colorCode);
  });

  test('Edit pipelineLabel', async () => {
    const mutation = `
      mutation pipelineLabelsEdit($_id: String! ${commonParamDefs}){
        pipelineLabelsEdit(_id: $_id ${commonParams}) {
          _id
          ${commonReturn}
        }
      }
    `;

    const edited = await graphqlRequest(mutation, 'pipelineLabelsEdit', { _id: pipelineLabel._id, ...args });

    expect(edited._id).toBe(pipelineLabel._id);
    expect(edited.name).toBe(args.name);
    expect(edited.colorCode).toBe(args.colorCode);
    expect(edited.pipelineId).toBe(args.pipelineId);
  });

  test('Remove pipelineLabel', async () => {
    const mutation = `
      mutation pipelineLabelsRemove($_id: String!) {
        pipelineLabelsRemove(_id: $_id)
      }
    `;

    await graphqlRequest(mutation, 'pipelineLabelsRemove', { _id: pipelineLabel._id });

    expect(await PipelineLabels.find({ _id: { $in: [pipelineLabel._id] } })).toEqual([]);
  });
});
