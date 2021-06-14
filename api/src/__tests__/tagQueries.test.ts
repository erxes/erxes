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
    const parentTag = await tagsFactory({ type: 'customer' });
    const tag = await tagsFactory({
      type: 'customer',
      parentId: parentTag._id
    });

    await tagsFactory({ type: 'company' });
    await tagsFactory({ type: 'company' });

    await Tags.updateOne(
      { _id: parentTag._id },
      { $set: { relatedIds: [tag._id] } }
    );

    const qry = `
      query tags($type: String, $searchValue: String) {
        tags(type: $type, searchValue: $searchValue) {
          _id
          name
          type
          colorCode
          createdAt
          objectCount
          totalObjectCount
        }
      }
    `;

    // customer ======================
    let response = await graphqlRequest(qry, 'tags', { type: 'customer' });
    const parent = response.find(t => t._id === parentTag._id);

    expect(response.length).toBe(2);
    expect(parent.totalObjectCount).toBe(0);

    // company =======================
    response = await graphqlRequest(qry, 'tags', { type: 'company' });

    expect(response.length).toBe(2);

    // customer with searchValue =======================
    response = await graphqlRequest(qry, 'tags', {
      type: 'customer',
      searchValue: tag.name
    });

    expect(response.length).toBe(1);
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
