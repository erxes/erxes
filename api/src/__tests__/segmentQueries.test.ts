import * as faker from 'faker';
import * as sinon from 'sinon';
import { graphqlRequest } from '../db/connection';
import { boardFactory, pipelineFactory, segmentFactory } from '../db/factories';
import { Segments } from '../db/models';
import * as elk from '../elasticsearch';

import './setup.ts';

describe('segmentQueries', () => {
  afterEach(async () => {
    // Clearing test data
    await Segments.deleteMany({});
  });

  test('Segments', async () => {
    // Creating test data
    const board = await boardFactory({});
    const pipeline = await pipelineFactory({ boardId: board._id });

    await segmentFactory({ contentType: 'customer' });
    await segmentFactory({ contentType: 'company' });
    await segmentFactory({
      contentType: 'deal',
      boardId: board._id,
      pipelineId: pipeline._id
    });

    const qry = `
      query segments($contentTypes: [String]!, $boardId: String, $pipelineId: String) {
        segments(contentTypes: $contentTypes, boardId: $boardId, pipelineId: $pipelineId) {
          _id
        }
      }
    `;

    // customer segment ==================
    let response = await graphqlRequest(qry, 'segments', {
      contentTypes: ['customer']
    });

    expect(response.length).toBe(1);

    // company segment ==================
    response = await graphqlRequest(qry, 'segments', {
      contentTypes: ['company']
    });

    expect(response.length).toBe(1);

    // deal segment ==================
    response = await graphqlRequest(qry, 'segments', {
      contentTypes: ['deal'],
      boardId: board._id,
      pipelineId: pipeline._id
    });

    expect(response.length).toBe(1);
  });

  test('Segment detail', async () => {
    const segment = await segmentFactory();

    await segmentFactory({ subOf: segment._id });
    await segmentFactory({ subOf: segment._id });

    const qry = `
      query segmentDetail($_id: String) {
        segmentDetail(_id: $_id) {
          _id
          contentType
          name
          description
          subOf
          color
          conditions
          count
          subSegmentConditions { _id }

          getSubSegments { _id }
        }
      }
    `;

    const response = await graphqlRequest(qry, 'segmentDetail', {
      _id: segment._id
    });

    expect(response._id).toBe(segment._id);
    expect(response.getSubSegments.length).toBe(2);
  });

  test('Get segment head', async () => {
    await segmentFactory({ subOf: faker.random.word() });
    await segmentFactory({ subOf: faker.random.word() });
    await segmentFactory();
    await segmentFactory();
    await segmentFactory();

    const qry = `
      query segmentsGetHeads {
        segmentsGetHeads {
          _id
        }
      }
    `;

    const responses = await graphqlRequest(qry, 'segmentsGetHeads');

    expect(responses.length).toBe(3);
  });

  test('events', async () => {
    const mock = sinon.stub(elk, 'fetchElk').callsFake(() => {
      return Promise.resolve({
        aggregations: {
          names: {
            buckets: [
              {
                key: 'pageView',
                hits: {
                  hits: {
                    hits: [
                      {
                        _source: {
                          name: 'pageView',
                          attributes: [
                            {
                              field: 'url',
                              value: '/test'
                            }
                          ]
                        }
                      }
                    ]
                  }
                }
              }
            ]
          }
        }
      });
    });

    const qry = `
      query segmentsEvents($contentType: String!) {
        segmentsEvents(contentType: $contentType)
      }
    `;

    const response = await graphqlRequest(qry, 'segmentsEvents', {
      contentType: 'customer'
    });

    expect(response.length).toBe(1);

    mock.restore();
  });

  test('segmentsPreviewCount', async () => {
    const qry = `
      query segmentsPreviewCount($contentType: String!, $conditions: JSON) {
        segmentsPreviewCount(contentType: $contentType, conditions: $conditions)
      }
    `;

    await graphqlRequest(qry, 'segmentsPreviewCount', {
      contentType: 'customer',
      conditions: []
    });
  });
});
