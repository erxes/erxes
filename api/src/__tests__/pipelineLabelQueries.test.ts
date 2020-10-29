import { graphqlRequest } from '../db/connection';
import { pipelineFactory, pipelineLabelFactory } from '../db/factories';
import { PipelineLabels } from '../db/models';

import './setup.ts';

describe('pipelineLabelQueries', () => {
  afterEach(async () => {
    // Clearing test data
    await PipelineLabels.deleteMany({});
  });

  test('Pipeline labels', async () => {
    const pipeline = await pipelineFactory();
    const pipelineId = pipeline._id;

    const args = { pipelineId };

    await pipelineLabelFactory({ pipelineId });
    await pipelineLabelFactory({ pipelineId });
    await pipelineLabelFactory({ pipelineId });

    const qry = `
      query pipelineLabels($pipelineId: String!) {
        pipelineLabels(pipelineId: $pipelineId) {
          _id
          name
          pipelineId
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

    const response = await graphqlRequest(qry, 'pipelineLabelDetail', {
      _id: pipelineLabel._id
    });

    expect(response._id).toBe(pipelineLabel._id);
  });
});
