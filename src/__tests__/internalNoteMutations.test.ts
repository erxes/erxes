import { connect, disconnect, graphqlRequest } from '../db/connection';
import { internalNoteFactory, userFactory } from '../db/factories';
import { InternalNotes, Users } from '../db/models';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('InternalNotes mutations', () => {
  let _user;
  let _internalNote;
  let context;

  beforeEach(async () => {
    // Creating test data
    _user = await userFactory({});
    _internalNote = await internalNoteFactory({});

    context = { user: _user };
  });

  afterEach(async () => {
    // Clearing test data
    await InternalNotes.remove({});
    await Users.remove({});
  });

  test('Add internal note', async () => {
    const { contentType, contentTypeId, content } = _internalNote;
    const args = { contentType, contentTypeId, content };

    const mutation = `
      mutation internalNotesAdd(
        $contentType: String!
        $contentTypeId: String
        $content: String
      ) {
        internalNotesAdd(
          contentType: $contentType
          contentTypeId: $contentTypeId
          content: $content
        ) {
          contentType
          contentTypeId
          content
        }
      }
    `;

    const internalNote = await graphqlRequest(mutation, 'internalNotesAdd', args, context);

    expect(internalNote.contentType).toBe(args.contentType);
    expect(internalNote.contentTypeId).toBe(args.contentTypeId);
    expect(internalNote.content).toBe(args.content);
  });

  test('Edit internal note', async () => {
    const { _id, content } = _internalNote;
    const args = { _id, content };

    const mutation = `
      mutation internalNotesEdit(
        $_id: String!
        $content: String
      ) {
        internalNotesEdit(
          _id: $_id
          content: $content
        ) {
          _id
          content
        }
      }
    `;

    const internalNote = await graphqlRequest(mutation, 'internalNotesEdit', args, context);

    expect(internalNote._id).toBe(args._id);
    expect(internalNote.content).toBe(args.content);
  });

  test('Remove internal note', async () => {
    const mutation = `
      mutation internalNotesRemove($_id: String!) {
        internalNotesRemove(_id: $_id) {
          _id
        }
      }
    `;

    await graphqlRequest(mutation, 'internalNotesRemove', { _id: _internalNote._id }, context);

    expect(await InternalNotes.findOne({ _id: _internalNote._id })).toBe(null);
  });
});
