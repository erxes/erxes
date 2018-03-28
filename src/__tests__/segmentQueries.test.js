/* eslint-env jest */

import { Segments } from '../db/models';
import { graphqlRequest, connect, disconnect } from '../db/connection';
import { segmentFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

const generateData = n => {
  const promises = [];

  let i = 1;

  while (i <= n) {
    promises.push(segmentFactory());

    i++;
  }

  return Promise.all(promises);
};

describe('segmentQueries', () => {
  afterEach(async () => {
    // Clearing test data
    await Segments.remove({});
  });

  test('Segments', async () => {
    const contentType = 'customer';

    // Creating test data
    await generateData(3);

    const query = `
      query segments($contentType: String!) {
        segments(contentType: $contentType) {
          _id
        }
      }
    `;

    const response = await graphqlRequest(query, 'segments', { contentType });

    expect(response.length).toBe(3);
  });

  test('Segment detail', async () => {
    const segment = await segmentFactory();

    const query = `
      query segmentDetail($_id: String) {
        segmentDetail(_id: $_id) {
          _id
        }
      }
    `;

    const response = await graphqlRequest(query, 'segmentDetail', { _id: segment._id });

    expect(response._id).toBe(segment._id);
  });

  test('Get segment head', async () => {
    await segmentFactory();

    const query = `
      query segmentsGetHeads {
        segmentsGetHeads {
          subOf
        }
      }
    `;

    const responses = await graphqlRequest(query, 'segmentsGetHeads');

    expect(responses).toEqual([]);
  });
});
