/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { CUSTOMER_CONTENT_TYPES } from '../data/constants';
import { ActivityLogs } from '../db/models';
import { ACTION_PERFORMER_TYPES, ACTIVITY_TYPES } from '../db/models/ActivityLogs';
import { userFactory, internalNoteFactory, customerFactory } from '../db/factories';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('ActivityLogs model methods', () => {
  test(`check whether not setting 'performedBy'
  is setting expected values in the collection or not`, async () => {
    const doc = {
      activityType: ACTIVITY_TYPES.INTERNAL_NOTE_CREATED,
      contentType: CUSTOMER_CONTENT_TYPES.CUSTOMER,
      contentTypeId: 'fakeCustomerId',
      performedBy: null,
    };

    const aLog = await ActivityLogs.createDoc(doc);

    expect(aLog.activityType).toBe(ACTIVITY_TYPES.INTERNAL_NOTE_CREATED);
    expect(aLog.contentType).toBe(CUSTOMER_CONTENT_TYPES.CUSTOMER);
    expect(aLog.contentTypeId).toBe(doc.contentTypeId);
    expect(aLog.performedBy.type).toBe(ACTION_PERFORMER_TYPES.SYSTEM);
  });

  test(`check if exception is being thrown when calling
  createInternalNoteLog without setting 'actionPerformedBy'`, async () => {
    const customer = await customerFactory();

    const internalNote = await internalNoteFactory({
      contentType: CUSTOMER_CONTENT_TYPES.CUSTOMER,
      contentTypeId: customer._id,
    });

    try {
      await ActivityLogs.createInternalNoteLog(internalNote);
    } catch (e) {
      expect(e.message).toBe(
        `'performedBy' must be supplied when adding activity log for internal note`,
      );
    }
  });

  test(`createInternalNoteLog with setting 'actionPerformedBy'`, async () => {
    const user = await userFactory({});

    const customer = await customerFactory();

    const internalNote = await internalNoteFactory({
      contentType: CUSTOMER_CONTENT_TYPES.CUSTOMER,
      contentTypeId: customer,
    });

    const aLog = await ActivityLogs.createInternalNoteLog(internalNote, user);

    expect(aLog.performedBy.type).toBe(ACTION_PERFORMER_TYPES.USER);
    expect(aLog.performedBy.id).toBe(user._id);
    expect(aLog.contentType).toBe(CUSTOMER_CONTENT_TYPES.CUSTOMER);
    expect(aLog.contentTypeId).toBe(internalNote._id);
    expect(aLog.activityType).toBe(ACTIVITY_TYPES.INTERNAL_NOTE_CREATED);
  });

  test(`check if exception is being thrown when calling
  createSegmentLog without setting 'actionPerformedBy'`, async () => {});

  test(`createSegmentLog with setting 'actionPerformedBy'`, async () => {});
});
