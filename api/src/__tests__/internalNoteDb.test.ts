import * as faker from 'faker';
import {
  companyFactory,
  customerFactory,
  internalNoteFactory,
  userFactory
} from '../db/factories';
import { InternalNotes, Users } from '../db/models';
import { ACTIVITY_CONTENT_TYPES } from '../db/models/definitions/constants';

import './setup.ts';

/*
 * Generate test data
 */
const generateData = () => ({
  contentType: 'customer',
  contentTypeId: 'DFDFAFSFSDDSF',
  content: faker.random.word()
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
    _user = await userFactory({});
    _internalNote = await internalNoteFactory({});
  });

  afterEach(async () => {
    // Clearing test data
    await InternalNotes.deleteMany({});
    await Users.deleteMany({});
  });

  test('Get internal note', async () => {
    try {
      await InternalNotes.getInternalNote('fakeId');
    } catch (e) {
      expect(e.message).toBe('Internal note not found');
    }

    const response = await InternalNotes.getInternalNote(_internalNote._id);

    expect(response).toBeDefined();
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

    const internalNoteObj = await InternalNotes.updateInternalNote(
      _internalNote._id,
      doc
    );

    checkValues(internalNoteObj, doc);
  });

  test('Remove internalNote valid', async () => {
    try {
      await InternalNotes.removeInternalNote('DFFFDSFD');
    } catch (e) {
      expect(e.message).toBe('InternalNote not found with id DFFFDSFD');
    }

    let count = await InternalNotes.find({
      _id: _internalNote._id
    }).countDocuments();
    expect(count).toBe(1);

    await InternalNotes.removeInternalNote(_internalNote._id);

    count = await InternalNotes.find({
      _id: _internalNote._id
    }).countDocuments();
    expect(count).toBe(0);
  });

  test('changeCustomer', async () => {
    const customer = await customerFactory({});
    const newCustomer = await customerFactory({});

    await internalNoteFactory({
      contentType: ACTIVITY_CONTENT_TYPES.CUSTOMER,
      contentTypeId: customer._id
    });

    const updatedInternalNotes = await InternalNotes.changeCustomer(
      newCustomer._id,
      [customer._id]
    );

    for (const internalNote of updatedInternalNotes) {
      expect(internalNote.contentTypeId).toEqual(newCustomer._id);
    }
  });

  test('changeCompany', async () => {
    const company = await companyFactory({});
    const newCompany = await companyFactory({});

    await internalNoteFactory({
      contentType: ACTIVITY_CONTENT_TYPES.COMPANY,
      contentTypeId: company._id
    });

    const updatedInternalNotes = await InternalNotes.changeCompany(
      newCompany._id,
      [company._id]
    );

    for (const internalNote of updatedInternalNotes) {
      expect(internalNote.contentTypeId).toEqual(newCompany._id);
    }
  });

  test('removeCustomerInternalNotes', async () => {
    const customer = await customerFactory({});

    await internalNoteFactory({
      contentType: ACTIVITY_CONTENT_TYPES.CUSTOMER,
      contentTypeId: customer._id
    });

    await internalNoteFactory({
      contentType: ACTIVITY_CONTENT_TYPES.CUSTOMER,
      contentTypeId: customer._id
    });

    await InternalNotes.removeInternalNotes('customer', [customer._id]);

    const internalNote = await InternalNotes.find({
      contentType: ACTIVITY_CONTENT_TYPES.CUSTOMER,
      contentTypeId: customer._id
    });

    expect(internalNote).toHaveLength(0);
  });

  test('removeCompanyInternalNotes', async () => {
    const company = await companyFactory({});

    await internalNoteFactory({
      contentType: ACTIVITY_CONTENT_TYPES.COMPANY,
      contentTypeId: company._id
    });

    await internalNoteFactory({
      contentType: ACTIVITY_CONTENT_TYPES.COMPANY,
      contentTypeId: company._id
    });

    await InternalNotes.removeInternalNotes('company', [company._id]);

    const internalNotes = await InternalNotes.find({
      contentType: ACTIVITY_CONTENT_TYPES.COMPANY,
      contentTypeId: company._id
    });

    expect(internalNotes).toHaveLength(0);
  });
});
