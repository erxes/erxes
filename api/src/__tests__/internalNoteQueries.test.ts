import * as faker from 'faker';
import { graphqlRequest } from '../db/connection';
import { internalNoteFactory } from '../db/factories';
import { InternalNotes } from '../db/models';

import './setup.ts';

describe('internalNoteQueries', () => {
  afterEach(async () => {
    // Clearing test data
    await InternalNotes.deleteMany({});
  });

  test('Internal notes', async () => {
    // Creating test data
    const contentTypeId = (faker && faker.random
      ? faker.random.number()
      : 999
    ).toString();

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
          createdAt

          createdUser { _id }
        }
      }
    `;

    // customer ===========================
    let responses = await graphqlRequest(qry, 'internalNotes', {
      contentType: 'company',
      contentTypeId
    });

    expect(responses.length).toBe(1);

    // company ============================
    responses = await graphqlRequest(qry, 'internalNotes', {
      contentType: 'company',
      contentTypeId
    });

    expect(responses.length).toBe(1);
  });

  test('Internal note details', async () => {
    const internalNote = await internalNoteFactory({});

    const qry = `
      query internalNoteDetail($_id: String!) {
        internalNoteDetail(_id: $_id) {
          _id
          contentType
          contentTypeId
          content
          createdUserId
          createdAt

          createdUser { _id }
        }
      }
    `;

    const response = await graphqlRequest(qry, 'internalNoteDetail', {
      _id: internalNote._id
    });

    expect(response._id).toBe(internalNote._id);
  });
});
