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
  test(`createInternalNoteLog without setting 'actionPerformedBy'`, async () => {
    const customer = await customerFactory();

    const internalNote = await internalNoteFactory({
      contentType: CUSTOMER_CONTENT_TYPES.CUSTOMER,
      contentTypeId: customer,
    });

    const aLog = await ActivityLogs.createInternalNoteLog(internalNote);

    expect(aLog.performedBy.type).toBe(ACTION_PERFORMER_TYPES.SYSTEM);
    expect(aLog.contentType).toBe(CUSTOMER_CONTENT_TYPES.CUSTOMER);
    expect(aLog.contentTypeId).toBe(internalNote._id);
    expect(aLog.activityType).toBe(ACTIVITY_TYPES.INTERNAL_NOTE_CREATED);
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
    // expect(aLog.actionPerformedBy).toBe(user);
  });
});
