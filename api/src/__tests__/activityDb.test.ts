import * as faker from 'faker';
import {
  activityLogFactory,
  checklistFactory,
  customerFactory,
  dealFactory,
  segmentFactory
} from '../db/factories';
import { ActivityLogs, Customers, Deals, Segments } from '../db/models';
import {
  IActivityLog,
  IActivityLogInput
} from '../db/models/definitions/activityLogs';
import { IItemCommonFieldsDocument } from '../db/models/definitions/boards';
import { ACTIVITY_ACTIONS } from '../db/models/definitions/constants';
import './setup.ts';

describe('Test activity model', () => {
  afterEach(async () => {
    // Clearing test data
    await ActivityLogs.deleteMany({});
    await Deals.deleteMany({});
    await Segments.deleteMany({});
    await Customers.deleteMany({});
  });

  test('Activity add activity', async () => {
    const contentId = faker.random.uuid();
    const contentType = 'customer';
    const createdBy = faker.random.uuid();
    const action = 'create';

    const activity = await ActivityLogs.addActivityLog({
      contentId,
      contentType,
      createdBy,
      action
    });

    expect(activity).toBeDefined();
    expect(activity.contentId).toEqual(contentId);
    expect(activity.contentType).toEqual(contentType);
    expect(activity.createdBy).toEqual(createdBy);
    expect(activity.action).toEqual(action);
  });

  test('Activity add activities', async () => {
    const docs: IActivityLogInput[] = [];

    new Array(2).fill(0).forEach(() => {
      const item = {} as IActivityLog;

      item.contentId = faker.random.uuid();
      item.contentType = 'customer';
      item.createdBy = faker.random.uuid();
      item.action = 'create';

      docs.push(item);
    });

    const activities = await ActivityLogs.addActivityLogs(docs);

    const count = await ActivityLogs.count({ contentType: 'customer' });

    for (const doc of docs) {
      const log = await ActivityLogs.findOne({ contentId: doc.contentId });

      if (!log) {
        fail('Log not found');
      }

      expect(log.contentType).toBe(doc.contentType);
      expect(log.createdBy).toBe(doc.createdBy);
      expect(log.action).toBe(doc.action);
    }

    expect(activities).toBeDefined();
    expect(count).toBe(2);
  });

  test('Activity remove activity', async () => {
    const activity = await activityLogFactory();

    await ActivityLogs.removeActivityLog(activity.contentId);

    const count = await ActivityLogs.find({
      contentId: activity.contentId
    }).countDocuments();

    expect(count).toBe(0);
  });

  test('Activity create board items log', async () => {
    const items = [] as IItemCommonFieldsDocument[];

    const deal = await dealFactory({ sourceConversationId: '123' });

    new Array(3).fill(0).forEach(() => {
      const item = {} as any;

      item._id = faker.random.uuid();
      item.userId = faker.random.uuid();
      item.sourceConversationId = '123';

      items.push(item);
    });

    const logs = await ActivityLogs.createBoardItemsLog({
      items,
      contentType: 'deal'
    });

    const logsCount = await ActivityLogs.count({ contentType: 'deal' });

    for (const item of items) {
      const log = await ActivityLogs.findOne({ contentId: item._id });

      if (!log) {
        fail('Log not found');
      }

      expect(log.contentType).toBe('deal');
      expect(log.createdBy).toBe(item.userId);
      expect(log.action).toBe(ACTIVITY_ACTIONS.CONVERT);
      expect(log.content).toBe(deal.sourceConversationId);
    }

    expect(logs).toBeDefined();
    expect(logsCount).toBe(3);
  });

  test('Activity create board item log', async () => {
    const deal = await dealFactory({ sourceConversationId: '123' });

    const activity = await ActivityLogs.createBoardItemLog({
      item: deal,
      contentType: 'deal'
    });

    expect(activity.contentId).toEqual(deal._id);
  });

  test('Activity create log from widget', async () => {
    const item = await customerFactory({});

    const activity1 = await ActivityLogs.createLogFromWidget(
      'create-customer',
      item
    );
    const activity2 = await ActivityLogs.createLogFromWidget(
      'create-company',
      item
    );

    expect(activity1.contentId).toEqual(item._id);
    expect(activity2.contentId).toEqual(item._id);
  });

  test('Activity create coc logs', async () => {
    const customer = await customerFactory({ mergedIds: ['1', '2'] });
    const cocs: any[] = [];

    new Array(3).fill(0).forEach(() => {
      const item: any = {};

      item._id = faker.random.uuid();
      item.ownerId = faker.random.uuid();
      item.mergedIds = customer.mergedIds;

      cocs.push(item);
    });

    const activities = await ActivityLogs.createCocLogs({
      cocs,
      contentType: 'customer'
    });

    const count = await ActivityLogs.count({ contentType: 'customer' });

    for (const coc of cocs) {
      const log = await ActivityLogs.findOne({ contentId: coc._id }).lean();

      if (!log) {
        fail('Log not found');
      }

      expect(log.createdBy).toBe(coc.ownerId);
      expect(log.content.toString()).toEqual(
        (customer.mergedIds || []).toString()
      );
      expect(log.action).toBe(ACTIVITY_ACTIONS.MERGE);
      expect(log.contentType).toBe('customer');
    }

    expect(activities).toBeDefined();
    expect(count).toBe(3);
  });

  test('Activity create coc log', async () => {
    const item = await customerFactory({ mergedIds: ['1', '2'] });
    const item2 = await customerFactory({
      integrationId: '123',
      ownerId: undefined
    });

    const activity1 = await ActivityLogs.createCocLog({
      coc: item,
      contentType: 'customer'
    });
    const activity2 = await ActivityLogs.createCocLog({
      coc: item2,
      contentType: 'customer'
    });

    expect(activity1.contentId).toEqual(item._id);
    expect(activity2.contentId).toEqual(item2._id);
  });

  test('Activity create board item movement log', async () => {
    const item = await dealFactory({});

    const activity1 = await ActivityLogs.createBoardItemMovementLog(
      item,
      'deal',
      '123',
      {}
    );

    expect(activity1.contentId).toEqual(item._id);
  });

  test('Activity create board item segment log', async () => {
    const customer = await customerFactory({});
    const segment1 = await segmentFactory({});
    const segment2 = await segmentFactory({});
    const segment3 = await segmentFactory({});

    await ActivityLogs.create({
      contentType: 'customer',
      action: 'segment',
      contentId: customer._id,
      content: {
        id: segment1._id,
        content: segment2
      }
    });

    const activity1 = await ActivityLogs.createSegmentLog(
      segment1,
      [customer._id],
      'customer'
    );
    const activity2 = await ActivityLogs.createSegmentLog(
      segment2,
      [customer._id],
      'customer'
    );
    const activity3 = await ActivityLogs.createSegmentLog(
      segment3,
      [
        customer._id,
        (await customerFactory({}))._id,
        (await customerFactory({}))._id,
        (await customerFactory({}))._id,
        (await customerFactory({}))._id
      ],
      'customer',
      3
    );

    expect(activity1).toBe(undefined);
    expect(activity2.length).toEqual(1);
    expect(activity3.length).toEqual(2);
  });

  test('Activity create assignee log', async () => {
    const activity = await ActivityLogs.createAssigneLog({
      contentId: '123',
      contentType: 'task',
      userId: '123',
      content: {}
    });

    expect(activity.contentId).toEqual('123');
  });

  test('Activity create checklist log', async () => {
    const deal = await checklistFactory({ contentTypeId: '123' });
    const activity = await ActivityLogs.createChecklistLog({
      item: deal,
      contentType: 'deal',
      action: 'delete'
    });

    expect(activity.contentId).toEqual('123');
  });

  test('Activity create archive log', async () => {
    const deal = await dealFactory({});
    const activity = await ActivityLogs.createArchiveLog({
      item: deal,
      contentType: 'deal',
      action: 'archive',
      userId: '123'
    });

    expect(activity.createdBy).toEqual('123');
  });
});
