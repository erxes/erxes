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
const generateData = () => ({
  contentType: 'customer',
  contentTypeId: 'DFDFAFSFSDDSF',
  content: faker.random.word(),
});

/*
 * Check values
 */
const checkValues = (internalNoteObj, doc) => {
  expect(internalNoteObj.contentType).toBe(doc.contentType);
  expect(internalNoteObj.contentTypeId).toBe(doc.contentTypeId);
  expect(internalNoteObj.content).toBe(doc.content);
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

  test('Create internalNote', async () => {
    // Login required
    expect(() => internalNoteMutations.internalNotesAdd({}, {}, {})).toThrowError('Login required');

    // valid
    const doc = generateData();

    const internalNoteObj = await internalNoteMutations.internalNotesAdd({}, doc, { user: _user });

    checkValues(internalNoteObj, doc);
    expect(internalNoteObj.createdUserId).toBe(_user._id);
  });

  test('Edit internalNote login required', async () => {
    expect.assertions(1);

    try {
      await internalNoteMutations.internalNotesEdit({}, { _id: _internalNote.id }, {});
    } catch (e) {
      expect(e.message).toEqual('Login required');
    }
  });

  test('Edit internalNote valid', async () => {
    const doc = generateData();

    const internalNoteObj = await internalNoteMutations.internalNotesEdit(
      {},
      { _id: _internalNote._id, ...doc },
      { user: _user },
    );

    checkValues(internalNoteObj, doc);
  });

  test('Remove internalNote login required', async () => {
    expect.assertions(1);

    try {
      await internalNoteMutations.internalNotesRemove({}, { _id: _internalNote.id }, {});
    } catch (e) {
      expect(e.message).toEqual('Login required');
    }
  });

  test('Remove internalNote valid', async () => {
    const internalNoteDeletedObj = await internalNoteMutations.internalNotesRemove(
      {},
      { _id: _internalNote.id },
      { user: _user },
    );

    expect(internalNoteDeletedObj.id).toBe(_internalNote.id);

    const internalNoteObj = await InternalNotes.findOne({ _id: _internalNote.id });
    expect(internalNoteObj).toBeNull();
  });
});
