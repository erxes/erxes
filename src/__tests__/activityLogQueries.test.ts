import * as faker from 'faker';
import { graphqlRequest } from '../db/connection';
import { activityLogFactory, userFactory } from '../db/factories';
import { ActivityLogs, Users } from '../db/models';
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_CONTENT_TYPES,
  ACTIVITY_PERFORMER_TYPES,
  ACTIVITY_TYPES,
} from '../db/models/definitions/constants';

import './setup.ts';

describe('activityLogQueries', () => {
  let user;
  const commonParamDefs = `
    $contentType: String!,
    $contentId: String!,
    $activityType: String,
    $limit: Int,
  `;

  const commonParams = `
    contentType: $contentType
    contentId: $contentId
    activityType: $activityType
    limit: $limit
  `;

  const qryActivityLogs = `
    query activityLogs(${commonParamDefs}) {
      activityLogs(${commonParams}) {
        _id
        action
        id
        createdAt
        content
        by {
          _id
          type
          details {
            avatar
            fullName
            position
          }
        }
      }
    }
  `;

  const contentType = ACTIVITY_CONTENT_TYPES.CUSTOMER;
  const activityType = ACTIVITY_TYPES.CUSTOMER;

  const contentId = faker.random.uuid();
  const activityId = faker.random.uuid();

  const args: any = {
    activity: { id: activityId, type: activityType, action: ACTIVITY_ACTIONS.CREATE, content: 'content' },
    contentType: { type: contentType, id: contentId },
    performer: {},
  };

  const filter: any = { contentType, activityType, contentId };

  beforeEach(async () => {
    user = await userFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await ActivityLogs.deleteMany({});
    await Users.deleteMany({});
  });

  test('Activity log list', async () => {
    const activityLog = await activityLogFactory(args);

    const responses = await graphqlRequest(qryActivityLogs, 'activityLogs', filter);

    const activity = activityLog.activity;

    expect(responses[0].id).toBe(activity.id);
    expect(responses[0].action).toBe(`${activity.type}-${activity.action}`);
    expect(responses[0].content).toBe(activity.content);
  });

  test('Activity log list (performer`s type is USER)', async () => {
    args.performer = {
      type: ACTIVITY_PERFORMER_TYPES.USER,
      id: user._id,
    };

    await activityLogFactory(args);

    const responses = await graphqlRequest(qryActivityLogs, 'activityLogs', filter);

    expect(responses[0].by._id).toBe(user._id);
    expect(responses[0].by.type).toBe(ACTIVITY_PERFORMER_TYPES.USER);
  });

  test('Activity log list (performer`s type is USER and id is FAKE)', async () => {
    args.performer = {
      type: ACTIVITY_PERFORMER_TYPES.USER,
      id: 'fakeId',
    };

    await activityLogFactory(args);

    const responses = await graphqlRequest(qryActivityLogs, 'activityLogs', filter);

    expect(responses[0].by).toBeNull();
  });

  test('Activity log list (performer`s type is USER and id is FAKE)', async () => {
    args.performer = {
      type: ACTIVITY_PERFORMER_TYPES.USER,
      id: 'fakeId',
    };

    await activityLogFactory(args);

    const responses = await graphqlRequest(qryActivityLogs, 'activityLogs', filter);

    expect(responses[0].by).toBeNull();
  });

  test('Activity log list (performer`s type is CUSTOMER and id is undefined)', async () => {
    args.performer = {
      type: ACTIVITY_PERFORMER_TYPES.CUSTOMER,
    };

    await activityLogFactory(args);

    const responses = await graphqlRequest(qryActivityLogs, 'activityLogs', filter);

    expect(responses[0].by.type).toBe(ACTIVITY_PERFORMER_TYPES.CUSTOMER);
  });

  test('Activity log list (limit filter)', async () => {
    await activityLogFactory(args);
    await activityLogFactory(args);
    await activityLogFactory(args);

    filter.limit = 2;
    const responses = await graphqlRequest(qryActivityLogs, 'activityLogs', filter);

    expect(responses.length).toBe(2);
  });

  test('Activity log list (no activity type)', async () => {
    await activityLogFactory({ contentType: { type: contentType, id: contentId } });

    // filtering when no activity type
    filter.activityType = '';

    const responses = await graphqlRequest(qryActivityLogs, 'activityLogs', filter);

    expect(responses.length).toBe(1);
  });
});
