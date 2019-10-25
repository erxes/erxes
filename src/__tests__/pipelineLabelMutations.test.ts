import * as faker from 'faker';
import { graphqlRequest } from '../db/connection';
import { pipelineLabelFactory } from '../db/factories';
import { PipelineLabels } from '../db/models';

import { BOARD_TYPES } from '../db/models/definitions/constants';
import './setup.ts';

/*
 * Generate test data
 */

describe('PipelineLabels mutations', () => {
  let pipelineLabel;

  const commonParamDefs = `
    $name: String!
    $type: String!
    $pipelineId: String!
    $colorCode: String!
  `;

  const commonParams = `
    name: $name
    type: $type
    pipelineId: $pipelineId
    colorCode: $colorCode
  `;

  const commonReturn = `
    name
    type
    pipelineId
    colorCode
  `;

  const args = {
    name: faker.name.findName(),
    type: BOARD_TYPES.DEAL,
    pipelineId: faker.random.word(),
    colorCode: faker.random.word(),
  };

  beforeEach(async () => {
    // Creating test data
    pipelineLabel = await pipelineLabelFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await PipelineLabels.deleteMany({});
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
    expect(created.type).toBe(args.type);
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
    expect(edited.type).toBe(args.type);
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
