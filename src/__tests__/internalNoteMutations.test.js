/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import faker from 'faker';
import { connect, disconnect } from '../db/connection';
import { InternalNotes, Users } from '../db/models';
import { userFactory, internalNoteFactory } from '../db/factories';
import internalNoteMutations from '../data/resolvers/mutations/internalNotes';

beforeAll(() => connect());

afterAll(() => disconnect());

/*
 * Generate test data
 */
const doc = {
  contentType: 'customer',
  contentTypeId: 'DFDFAFSFSDDSF',
  content: faker.random.word(),
};

describe('InternalNotes mutations', () => {
  let _user;
  let _internalNote;

  beforeEach(async () => {
    // Creating test data
    _user = await userFactory();
    _internalNote = await internalNoteFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await InternalNotes.remove({});
    await Users.remove({});
  });

  test('Check login required', async () => {
    expect.assertions(3);

    const check = async fn => {
      try {
        await fn({}, {}, {});
      } catch (e) {
        expect(e.message).toEqual('Login required');
      }
    };

    // add
    check(internalNoteMutations.internalNotesAdd);

    // edit
    check(internalNoteMutations.internalNotesEdit);

    // add company
    check(internalNoteMutations.internalNotesRemove);
  });

  test('Create internalNote', async () => {
    InternalNotes.createInternalNote = jest.fn(() => ({
      _id: 'testInternalNoteId',
      contentType: 'customer',
      contentTypeId: 'customer',
    }));

    await internalNoteMutations.internalNotesAdd({}, doc, { user: _user });

    expect(InternalNotes.createInternalNote).toBeCalledWith(doc, _user);
  });

  test('Edit internalNote valid', async () => {
    InternalNotes.updateInternalNote = jest.fn();

    await internalNoteMutations.internalNotesEdit(
      {},
      { _id: _internalNote._id, ...doc },
      { user: _user },
    );

    expect(InternalNotes.updateInternalNote).toBeCalledWith(_internalNote._id, doc);
  });

  test('Remove internalNote valid', async () => {
    InternalNotes.removeInternalNote = jest.fn();

    await internalNoteMutations.internalNotesRemove({}, { _id: _internalNote.id }, { user: _user });

    expect(InternalNotes.removeInternalNote).toBeCalledWith(_internalNote.id);
  });
});
