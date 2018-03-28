/* eslint-env jest */

import faker from 'faker';
import { InternalNotes } from '../db/models';
import { graphqlRequest, connect, disconnect } from '../db/connection';
import { internalNoteFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

const generateData = params => {
  const { n, args } = params;
  const promises = [];

  let i = 1;

  while (i <= n) {
    promises.push(internalNoteFactory(args));

    i++;
  }

  return Promise.all(promises);
};

describe('internalNoteQueries', () => {
  afterEach(async () => {
    // Clearing test data
    await InternalNotes.remove({});
  });

  test('Internal notes', async () => {
    const args = {
      contentType: 'customer',
      contentTypeId: faker.random.number(),
    };

    // Creating test data
    await generateData({ n: 5, args });

    const query = `
      query internalNotes($contentType: String! $contentTypeId: String) {
        internalNotes(contentType: $contentType contentTypeId: $contentTypeId) {
          _id
        }
      }
    `;

    const responses = await graphqlRequest(query, 'internalNotes', args);

    expect(responses.length).toBe(5);
  });
});
