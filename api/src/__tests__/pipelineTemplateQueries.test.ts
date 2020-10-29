import { graphqlRequest } from '../db/connection';
import { pipelineTemplateFactory } from '../db/factories';
import { PipelineTemplates } from '../db/models';

import { BOARD_TYPES } from '../db/models/definitions/constants';
import './setup.ts';

describe('pipelineTemplateQueries', () => {
  afterEach(async () => {
    // Clearing test data
    await PipelineTemplates.deleteMany({});
  });

  test('Pipeline templates', async () => {
    const args = {
      type: BOARD_TYPES.GROWTH_HACK
    };

    await pipelineTemplateFactory();
    await pipelineTemplateFactory();
    await pipelineTemplateFactory();

    const qry = `
      query pipelineTemplates($type: String!) {
        pipelineTemplates(type: $type) {
          _id
          name
          description
        }
      }
    `;

    const response = await graphqlRequest(qry, 'pipelineTemplates', args);

    expect(response.length).toBe(3);
  });

  test('Pipeline template detail', async () => {
    const qry = `
      query pipelineTemplateDetail($_id: String!) {
        pipelineTemplateDetail(_id: $_id) {
          _id
        }
      }
    `;

    const pipelineTemplate = await pipelineTemplateFactory();

    const response = await graphqlRequest(qry, 'pipelineTemplateDetail', {
      _id: pipelineTemplate._id
    });

    expect(response._id).toBe(pipelineTemplate._id);
  });

  test('Pipeline template total count', async () => {
    await pipelineTemplateFactory();
    await pipelineTemplateFactory();
    await pipelineTemplateFactory();
    await pipelineTemplateFactory();

    const qry = `
      query pipelineTemplatesTotalCount {
        pipelineTemplatesTotalCount
      }
    `;

    const response = await graphqlRequest(qry, 'pipelineTemplatesTotalCount');

    expect(response).toBe(4);
  });
});
