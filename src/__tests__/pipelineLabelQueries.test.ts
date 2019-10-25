import { graphqlRequest } from '../db/connection';
import { pipelineFactory, pipelineLabelFactory } from '../db/factories';
import { PipelineLabels } from '../db/models';

import { BOARD_TYPES } from '../db/models/definitions/constants';
import './setup.ts';

describe('pipelineLabelQueries', () => {
  afterEach(async () => {
    // Clearing test data
    await PipelineLabels.deleteMany({});
  });

  test('Pipeline labels', async () => {
    const type = BOARD_TYPES.GROWTH_HACK;
    const pipeline = await pipelineFactory();
    const pipelineId = pipeline._id;

    const args = { type, pipelineId };

    await pipelineLabelFactory({ type, pipelineId });
    await pipelineLabelFactory({ type, pipelineId });
    await pipelineLabelFactory({ type, pipelineId });

    const qry = `
      query pipelineLabels($type: String!, $pipelineId: String!) {
        pipelineLabels(type: $type, pipelineId: $pipelineId) {
          _id
          name
          pipelineId
          type
          colorCode
        }
      }
    `;

    const response = await graphqlRequest(qry, 'pipelineLabels', args);

    expect(response.length).toBe(3);
  });

  test('Pipeline label detail', async () => {
    const qry = `
      query pipelineLabelDetail($_id: String!) {
        pipelineLabelDetail(_id: $_id) {
          _id
        }
      }
    `;

    const pipelineLabel = await pipelineLabelFactory();

    const response = await graphqlRequest(qry, 'pipelineLabelDetail', { _id: pipelineLabel._id });

    expect(response._id).toBe(pipelineLabel._id);
  });
});
