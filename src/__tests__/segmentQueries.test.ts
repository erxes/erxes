import * as faker from 'faker';
import { connect, disconnect, graphqlRequest } from '../db/connection';
import { segmentFactory } from '../db/factories';
import { Segments } from '../db/models';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('segmentQueries', () => {
  afterEach(async () => {
    // Clearing test data
    await Segments.remove({});
  });

  test('Segments', async () => {
    // Creating test data
    await segmentFactory({ contentType: 'customer' });
    await segmentFactory({ contentType: 'company' });

    const qry = `
      query segments($contentType: String!) {
        segments(contentType: $contentType) {
          _id
          contentType
          name
          description
          subOf
          color
          connector
          conditions

          getParentSegment { _id }
          getSubSegments { _id }
        }
      }
    `;

    // customer segment ==================
    let response = await graphqlRequest(qry, 'segments', {
      contentType: 'customer',
    });

    expect(response.length).toBe(1);

    // company segment ==================
    response = await graphqlRequest(qry, 'segments', {
      contentType: 'company',
    });

    expect(response.length).toBe(1);
  });

  test('Segment detail', async () => {
    const segment = await segmentFactory();

    const qry = `
      query segmentDetail($_id: String) {
        segmentDetail(_id: $_id) {
          _id
        }
      }
    `;

    const response = await graphqlRequest(qry, 'segmentDetail', {
      _id: segment._id,
    });

    expect(response._id).toBe(segment._id);
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
});
