/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import {
  COC_CONTENT_TYPES,
  ACTIVITY_PERFORMER_TYPES,
  ACTIVITY_TYPES,
  ACTIVITY_ACTIONS,
} from '../data/constants';
import { ActivityLogs, Conversations } from '../db/models';
import {
  userFactory,
  internalNoteFactory,
  customerFactory,
  companyFactory,
  conversationFactory,
  segmentFactory,
  dealFactory,
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
      performer: null,
    };

    const aLog = await ActivityLogs.createDoc(doc);

    expect(aLog.activity.toObject()).toEqual(activityDoc);
    expect(aLog.coc.toObject()).toEqual(customerDoc);
    expect(aLog.performedBy.toObject().type).toBe(ACTIVITY_PERFORMER_TYPES.SYSTEM);
  });

  test(`createInternalNoteLog with setting 'user'`, async () => {
    const user = await userFactory({});

    const customer = await customerFactory();

    const internalNote = await internalNoteFactory({
      contentType: COC_CONTENT_TYPES.CUSTOMER,
      contentTypeId: customer,
    });

    const aLog = await ActivityLogs.createInternalNoteLog(internalNote, user);

    expect(aLog.performedBy.type).toBe(ACTIVITY_PERFORMER_TYPES.USER);
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
      type: ACTIVITY_PERFORMER_TYPES.SYSTEM,
    });
  });

  test(`Testing found segment`, async () => {
    const segment = await segmentFactory({});
    const customer = await customerFactory({});
    await ActivityLogs.createSegmentLog(segment, customer);

    await ActivityLogs.createSegmentLog(segment, customer);

    expect(
      await ActivityLogs.find({
        'activity.type': ACTIVITY_TYPES.SEGMENT,
        'activity.action': ACTIVITY_ACTIONS.CREATE,
        'activity.id': segment._id,
        'coc.type': segment.contentType,
        'coc.id': customer._id,
      }),
    ).toHaveLength(1);
  });

  test(`check if exceptions are being thrown as intended when
    calling createConversationLog`, async () => {
    expect.assertions(2);
    const conversation = await conversationFactory({});

    try {
      await ActivityLogs.createConversationLog(conversation, null);
    } catch (e) {
      expect(e.message).toBe(
        `'customer' must be supplied when adding activity log for conversations`,
      );
    }

    try {
      await ActivityLogs.createConversationLog(conversation, {});
    } catch (e) {
      expect(e.message).toBe(
        `'customer' must be supplied when adding activity log for conversations`,
      );
    }
  });

  test(`check if createConversationLog is working as intended`, async () => {
    const conversation = await conversationFactory({});
    const companyA = await companyFactory({});
    const companyB = await companyFactory({});
    const customer = await customerFactory({
      companyIds: [companyA._id, companyB._id],
    });

    let aLog = await ActivityLogs.createConversationLog(conversation, customer);

    // check customer conversation log
    expect(aLog.performedBy.toObject()).toEqual({
      type: ACTIVITY_PERFORMER_TYPES.CUSTOMER,
      id: customer._id,
    });
    expect(aLog.coc.toObject()).toEqual({
      type: COC_CONTENT_TYPES.CUSTOMER,
      id: customer._id,
    });
    expect(aLog.activity.toObject()).toEqual({
      type: ACTIVITY_TYPES.CONVERSATION,
      action: ACTIVITY_ACTIONS.CREATE,
      content: conversation.content,
      id: conversation._id,
    });

    // check company conversation logs =====================================
    aLog = await ActivityLogs.findOne({
      'activity.type': ACTIVITY_TYPES.CONVERSATION,
      'activity.action': ACTIVITY_ACTIONS.CREATE,
      'activity.id': conversation._id,
      'coc.type': COC_CONTENT_TYPES.COMPANY,
      'coc.id': companyA._id,
    });

    expect(aLog).toBeDefined();
    expect(aLog.coc.id).toBe(companyA._id);

    aLog = await ActivityLogs.findOne({
      'activity.type': ACTIVITY_TYPES.CONVERSATION,
      'activity.action': ACTIVITY_ACTIONS.CREATE,
      'activity.id': conversation._id,
      'coc.type': COC_CONTENT_TYPES.COMPANY,
      'coc.id': companyB._id,
    });

    expect(aLog).toBeDefined();
    expect(aLog.coc.id).toBe(companyB._id);

    expect(await ActivityLogs.find({}).count()).toBe(3);

    // test whether activity logs for this conversation is being duplicated or not ========
    await ActivityLogs.createConversationLog(conversation, customer);

    expect(await ActivityLogs.find({}).count()).toBe(3);
  });

  test(`createCustomerRegistrationLog`, async () => {
    const customer = await customerFactory({});
    const user = await userFactory({});

    const aLog = await ActivityLogs.createCustomerRegistrationLog(customer, user);

    expect(aLog.performedBy.toObject()).toEqual({
      type: ACTIVITY_PERFORMER_TYPES.USER,
      id: user._id,
    });
    expect(aLog.activity.toObject()).toEqual({
      type: ACTIVITY_TYPES.CUSTOMER,
      action: ACTIVITY_ACTIONS.CREATE,
      content: customer.getFullName(),
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
      type: ACTIVITY_PERFORMER_TYPES.USER,
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

  test(`createDealRegistrationLog`, async () => {
    const deal = await dealFactory({});
    const user = await userFactory({});

    const aLog = await ActivityLogs.createDealRegistrationLog(deal, user);

    expect(aLog.performedBy.toObject()).toEqual({
      type: ACTIVITY_PERFORMER_TYPES.USER,
      id: user._id,
    });
    expect(aLog.activity.toObject()).toEqual({
      type: ACTIVITY_TYPES.DEAL,
      action: ACTIVITY_ACTIONS.CREATE,
      content: deal.name,
      id: deal._id,
    });
    expect(aLog.coc.toObject()).toEqual({
      type: COC_CONTENT_TYPES.DEAL,
      id: deal._id,
    });
  });

  test(`changeCustomer`, async () => {
    const customer = await customerFactory({});
    const newCustomer = await customerFactory({});
    const conversation = await conversationFactory({});

    await ActivityLogs.createConversationLog(conversation, customer);

    const aLogs = await ActivityLogs.changeCustomer(newCustomer._id, [customer._id]);

    for (let aLog of aLogs) {
      expect(aLog.coc.toObject()).toEqual({
        type: COC_CONTENT_TYPES.CUSTOMER,
        id: newCustomer._id,
      });
    }
  });

  test(`changeCompany`, async () => {
    const company = await companyFactory({});
    const newCompany = await companyFactory({});
    const user = await userFactory({});

    await ActivityLogs.createCompanyRegistrationLog(company, user);

    const aLogs = await ActivityLogs.changeCompany(newCompany._id, [company._id]);

    for (let aLog of aLogs) {
      expect(aLog.coc.toObject()).toEqual({
        type: COC_CONTENT_TYPES.COMPANY,
        id: newCompany._id,
      });
    }
  });

  test(`removeCustomerActivityLog`, async () => {
    const customer = await customerFactory({});
    const conversation = await conversationFactory({});

    await ActivityLogs.createConversationLog(conversation, customer);
    const removed = await ActivityLogs.removeCustomerActivityLog(customer._id);

    const activityLog = await ActivityLogs.find({
      coc: {
        type: COC_CONTENT_TYPES.CUSTOMER,
        id: customer._id,
      },
    });

    expect(activityLog).toHaveLength(0);
    expect(removed.result).toEqual({ ok: 1, n: 1 });
  });

  test(`removeCompanyActivityLog`, async () => {
    const company = await companyFactory({});
    const user = await userFactory({});

    await ActivityLogs.createCompanyRegistrationLog(company, user);
    const removed = await ActivityLogs.removeCompanyActivityLog(company._id);

    const activityLog = await ActivityLogs.find({
      coc: {
        type: COC_CONTENT_TYPES.COMPANY,
        id: company._id,
      },
    });

    expect(activityLog).toHaveLength(0);
    expect(removed.result).toEqual({ ok: 1, n: 1 });
  });
});
