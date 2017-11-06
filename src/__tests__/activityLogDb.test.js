/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { CUSTOMER_CONTENT_TYPES } from '../data/constants';
import { ActivityLogs } from '../db/models';
import {
  ACTION_PERFORMER_TYPES,
  ACTIVITY_TYPES,
  ACTIVITY_ACTIONS,
} from '../db/models/ActivityLogs';
import { userFactory, internalNoteFactory, customerFactory } from '../db/factories';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('ActivityLogs model methods', () => {
  test(`check whether not setting 'performedBy'
  is setting expected values in the collection or not`, async () => {
    const activityDoc = {
      type: ACTIVITY_TYPES.INTERNAL_NOTE,
      action: ACTIVITY_ACTIONS.CREATE,
      id: 'testInternalNoteId',
    };

    const customerDoc = {
      type: CUSTOMER_CONTENT_TYPES.CUSTOMER,
      id: 'testCustomerId',
    };

    const doc = {
      activity: activityDoc,
      customer: customerDoc,
      performedBy: null,
    };

    const aLog = await ActivityLogs.createDoc(doc);

    expect(aLog.activity.toObject()).toEqual(activityDoc);
    expect(aLog.customer.toObject()).toEqual(customerDoc);
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
    expect(aLog.customer.type).toBe(CUSTOMER_CONTENT_TYPES.CUSTOMER);
    expect(aLog.customer.id).toBe(internalNote.contentTypeId);
    expect(aLog.activity.toObject()).toEqual({
      type: ACTIVITY_TYPES.INTERNAL_NOTE,
      action: ACTIVITY_ACTIONS.CREATE,
      id: internalNote._id,
    });
  });

  test(`check if exception is being thrown when calling
  createSegmentLog without setting 'actionPerformedBy'`, async () => {});

  test(`createSegmentLog with setting 'actionPerformedBy'`, async () => {});
});
