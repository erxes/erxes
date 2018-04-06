/* eslint-env jest */

import faker from 'faker';
import { InternalNotes } from '../db/models';
import { graphqlRequest, connect, disconnect } from '../db/connection';
import { internalNoteFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('internalNoteQueries', () => {
  afterEach(async () => {
    // Clearing test data
    await InternalNotes.remove({});
  });

  test('Internal notes', async () => {
    // Creating test data
    const contentTypeId = faker.random.number();

    await internalNoteFactory({ contentType: 'company', contentTypeId });
    await internalNoteFactory({ contentType: 'customer', contentTypeId });

    const qry = `
      query internalNotes($contentType: String! $contentTypeId: String) {
        internalNotes(contentType: $contentType contentTypeId: $contentTypeId) {
          _id
          contentType
          contentTypeId
          content
          createdUserId
          createdDate

          createdUser { _id }
        }
      }
    `;

    // customer ===========================
    let responses = await graphqlRequest(qry, 'internalNotes', {
      contentType: 'company',
      contentTypeId,
    });

    expect(responses.length).toBe(1);

    // company ============================
    responses = await graphqlRequest(qry, 'internalNotes', {
      contentType: 'company',
      contentTypeId,
    });

    expect(responses.length).toBe(1);
  });
});
