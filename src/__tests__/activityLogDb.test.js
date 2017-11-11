/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { COC_CONTENT_TYPES } from '../data/constants';
import { ActivityLogs, Conversations } from '../db/models';
import {
  ACTION_PERFORMER_TYPES,
  ACTIVITY_TYPES,
  ACTIVITY_ACTIONS,
} from '../db/models/ActivityLogs';
import {
  userFactory,
  internalNoteFactory,
  customerFactory,
  companyFactory,
  conversationMessageFactory,
  segmentFactory,
} from '../db/factories';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('ActivityLogs model methods', () => {
  afterEach(async () => {
    await ActivityLogs.remove({});
    await Conversations.remove({});
  });

  test(`check whether not setting 'user'
  is setting expected values in the collection or not`, async () => {
    const activityDoc = {
      type: ACTIVITY_TYPES.INTERNAL_NOTE,
      action: ACTIVITY_ACTIONS.CREATE,
      id: 'testInternalNoteId',
    };

    const customerDoc = {
      type: COC_CONTENT_TYPES.CUSTOMER,
      id: 'testCustomerId',
    };

    const doc = {
      activity: activityDoc,
      coc: customerDoc,
      performedBy: null,
    };

    const aLog = await ActivityLogs.createDoc(doc);

    expect(aLog.activity.toObject()).toEqual(activityDoc);
    expect(aLog.coc.toObject()).toEqual(customerDoc);
    expect(aLog.performedBy.type).toBe(ACTION_PERFORMER_TYPES.SYSTEM);
  });

  test(`check if exception is being thrown when calling
  createInternalNoteLog without setting 'user'`, async () => {
    const customer = await customerFactory();

    const internalNote = await internalNoteFactory({
      contentType: COC_CONTENT_TYPES.CUSTOMER,
      contentTypeId: customer._id,
    });

    try {
      await ActivityLogs.createInternalNoteLog(internalNote);
    } catch (e) {
      expect(e.message).toBe(`'user' must be supplied when adding activity log for internal note`);
    }
  });

  test(`createInternalNoteLog with setting 'user'`, async () => {
    const user = await userFactory({});

    const customer = await customerFactory();

    const internalNote = await internalNoteFactory({
      contentType: COC_CONTENT_TYPES.CUSTOMER,
      contentTypeId: customer,
    });

    const aLog = await ActivityLogs.createInternalNoteLog(internalNote, user);

    expect(aLog.performedBy.type).toBe(ACTION_PERFORMER_TYPES.USER);
    expect(aLog.performedBy.id).toBe(user._id);
    expect(aLog.coc.type).toBe(COC_CONTENT_TYPES.CUSTOMER);
    expect(aLog.coc.id).toBe(internalNote.contentTypeId);
    expect(aLog.activity.toObject()).toEqual({
      type: ACTIVITY_TYPES.INTERNAL_NOTE,
      action: ACTIVITY_ACTIONS.CREATE,
      id: internalNote._id,
      content: internalNote.content,
    });
  });

  test(`check if exception is being thrown when calling
  createSegmentLog without setting 'customer'`, async () => {
    expect.assertions(1);

    const segment = segmentFactory({});

    try {
      await ActivityLogs.createSegmentLog(segment, null);
    } catch (e) {
      expect(e.message).toBe('customer must be supplied');
    }
  });

  test(`createSegmentLog with setting 'customer'`, async () => {
    // check if the activity log is being created ==================
    const nameEqualsConditions = [
      {
        type: 'string',
        dateUnit: 'days',
        value: 'John Smith',
        operator: 'e',
        field: 'name',
      },
    ];

    const customer = await customerFactory({ name: 'john smith' });
    const segment = await segmentFactory({
      contentType: COC_CONTENT_TYPES.CUSTOMER,
      conditions: nameEqualsConditions,
    });

    const segmentLog = await ActivityLogs.createSegmentLog(segment, customer);

    expect(segmentLog.activity.toObject()).toEqual({
      type: ACTIVITY_TYPES.SEGMENT,
      action: ACTIVITY_ACTIONS.CREATE,
      content: segment.name,
      id: segment._id,
    });
    expect(segmentLog.coc.toObject()).toEqual({
      type: segment.contentType,
      id: customer._id,
    });
    expect(segmentLog.performedBy.toObject()).toEqual({
      type: ACTION_PERFORMER_TYPES.SYSTEM,
    });
  });

  test(`check if exceptions are being thrown as intended when calling createConversationMessageLog`, async () => {
    expect.assertions(2);
    const message = await conversationMessageFactory({});

    try {
      await ActivityLogs.createConversationMessageLog(message, null);
    } catch (e) {
      expect(e.message).toBe(
        `'customer' must be supplied when adding activity log for conversations`,
      );
    }

    try {
      await ActivityLogs.createConversationMessageLog(message, {});
    } catch (e) {
      expect(e.message).toBe(
        `'customer' must be supplied when adding activity log for conversations`,
      );
    }
  });

  test(`check if createConversationMessageLog is working as intended`, async () => {
    const message = await conversationMessageFactory({});
    const companyA = await companyFactory({});
    const companyB = await companyFactory({});
    const customer = await customerFactory({ companyIds: [companyA._id, companyB._id] });

    let aLog = await ActivityLogs.createConversationMessageLog(message, customer);

    // check customer conversation log
    expect(aLog.performedBy.toObject()).toEqual({
      type: ACTION_PERFORMER_TYPES.CUSTOMER,
    });
    expect(aLog.coc.toObject()).toEqual({
      type: COC_CONTENT_TYPES.CUSTOMER,
      id: customer._id,
    });
    expect(aLog.activity.toObject()).toEqual({
      type: ACTIVITY_TYPES.CONVERSATION_MESSAGE,
      action: ACTIVITY_ACTIONS.CREATE,
      content: message.content,
      id: message._id,
    });

    // check company conversation logs =====================================
    aLog = await ActivityLogs.findOne({
      'activity.type': ACTIVITY_TYPES.CONVERSATION_MESSAGE,
      'activity.action': ACTIVITY_ACTIONS.CREATE,
      'activity.id': message._id,
      'coc.type': COC_CONTENT_TYPES.COMPANY,
      'coc.id': companyA._id,
    });

    expect(aLog).toBeDefined();
    expect(aLog.coc.id).toBe(companyA._id);

    aLog = await ActivityLogs.findOne({
      'activity.type': ACTIVITY_TYPES.CONVERSATION_MESSAGE,
      'activity.action': ACTIVITY_ACTIONS.CREATE,
      'activity.id': message._id,
      'coc.type': COC_CONTENT_TYPES.COMPANY,
      'coc.id': companyB._id,
    });

    expect(aLog).toBeDefined();
    expect(aLog.coc.id).toBe(companyB._id);

    expect(await ActivityLogs.find({}).count()).toBe(3);

    // test whether activity logs for this conversation is being duplicated or not ========
    await ActivityLogs.createConversationMessageLog(message, customer);

    expect(await ActivityLogs.find({}).count()).toBe(3);
  });

  test(`createCustomerRegistrationLog`, async () => {
    const customer = await customerFactory({});
    const user = await userFactory({});

    const aLog = await ActivityLogs.createCustomerRegistrationLog(customer, user);

    expect(aLog.performedBy.toObject()).toEqual({
      type: ACTION_PERFORMER_TYPES.USER,
      id: user._id,
    });
    expect(aLog.activity.toObject()).toEqual({
      type: ACTIVITY_TYPES.CUSTOMER,
      action: ACTIVITY_ACTIONS.CREATE,
      content: customer.name,
      id: customer._id,
    });
    expect(aLog.coc.toObject()).toEqual({
      type: COC_CONTENT_TYPES.CUSTOMER,
      id: customer._id,
    });
  });

  test(`createCompanyRegistrationLog`, async () => {
    const company = await companyFactory({});
    const user = await userFactory({});

    const aLog = await ActivityLogs.createCompanyRegistrationLog(company, user);

    expect(aLog.performedBy.toObject()).toEqual({
      type: ACTION_PERFORMER_TYPES.USER,
      id: user._id,
    });
    expect(aLog.activity.toObject()).toEqual({
      type: ACTIVITY_TYPES.COMPANY,
      action: ACTIVITY_ACTIONS.CREATE,
      content: company.name,
      id: company._id,
    });
    expect(aLog.coc.toObject()).toEqual({
      type: COC_CONTENT_TYPES.COMPANY,
      id: company._id,
    });
  });
});
