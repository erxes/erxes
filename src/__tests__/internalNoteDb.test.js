/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import faker from 'faker';
import { connect, disconnect } from '../db/connection';
import { InternalNotes, Users } from '../db/models';
import { userFactory, internalNoteFactory } from '../db/factories';

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

describe('InternalNotes model test', () => {
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
    // valid
    const doc = generateData();

    const internalNoteObj = await InternalNotes.createInternalNote(doc, _user);

    checkValues(internalNoteObj, doc);
    expect(internalNoteObj.createdUserId).toBe(_user._id);
  });

  test('Edit internalNote valid', async () => {
    const doc = generateData();

    const internalNoteObj = await InternalNotes.updateInternalNote(_internalNote._id, doc);

    checkValues(internalNoteObj, doc);
  });

  test('Remove internalNote valid', async () => {
    try {
      await InternalNotes.removeInternalNote('DFFFDSFD');
    } catch (e) {
      expect(e.message).toBe('InternalNote not found with id DFFFDSFD');
    }

    let count = await InternalNotes.find({ _id: _internalNote._id }).count();
    expect(count).toBe(1);

    await InternalNotes.removeInternalNote(_internalNote._id);

    count = await InternalNotes.find({ _id: _internalNote._id }).count();
    expect(count).toBe(0);
  });
});
