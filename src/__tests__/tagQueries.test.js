/* eslint-env jest */

import { Tags } from '../db/models';
import { graphqlRequest, connect, disconnect } from '../db/connection';
import { tagsFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

const generateData = params => {
  const { n, type } = params;
  const promises = [];

  let i = 1;

  while (i <= n) {
    promises.push(tagsFactory({ type }));

    i++;
  }

  return Promise.all(promises);
};

describe('tagQueries', () => {
  afterEach(async () => {
    // Clearing test data
    await Tags.remove({});
  });

  test('Tags', async () => {
    const type = 'customer';

    // Creating test data
    await generateData({ n: 3, type });

    const query = `
      query tags($type: String) {
        tags(type: $type) {
          _id
        }
      }
    `;

    const response = await graphqlRequest(query, 'tags', { type });

    expect(response.length).toBe(3);
  });

  test('Tag detail', async () => {
    const tag = await tagsFactory({ type: 'customer' });

    const query = `
      query tagDetail($_id: String!) {
        tagDetail(_id: $_id) {
          _id
        }
      }
    `;

    const response = await graphqlRequest(query, 'tagDetail', { _id: tag._id });

    expect(response._id).toBe(tag._id);
  });
});
