import { graphqlRequest } from '../db/connection';
import { tagsFactory } from '../db/factories';
import { Tags } from '../db/models';

import './setup.ts';

describe('tagQueries', () => {
  afterEach(async () => {
    // Clearing test data
    await Tags.deleteMany({});
  });

  test('Tags', async () => {
    // Creating test data
    await tagsFactory({ type: 'customer' });
    await tagsFactory({ type: 'customer' });
    await tagsFactory({ type: 'company' });
    await tagsFactory({ type: 'company' });

    const qry = `
      query tags($type: String) {
        tags(type: $type) {
          _id
          name
          type
          colorCode
          createdAt
          objectCount
        }
      }
    `;

    // customer ======================
    let response = await graphqlRequest(qry, 'tags', { type: 'customer' });

    expect(response.length).toBe(2);

    // company =======================
    response = await graphqlRequest(qry, 'tags', { type: 'company' });

    expect(response.length).toBe(2);
  });

  test('Tag detail', async () => {
    const tag = await tagsFactory({ type: 'customer' });

    const qry = `
      query tagDetail($_id: String!) {
        tagDetail(_id: $_id) {
          _id
        }
      }
    `;

    const response = await graphqlRequest(qry, 'tagDetail', { _id: tag._id });

    expect(response._id).toBe(tag._id);
  });
});
