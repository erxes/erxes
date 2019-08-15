import * as faker from 'faker';
import { graphqlRequest } from '../db/connection';
import { activityLogFactory } from '../db/factories';
import { ActivityLogs } from '../db/models';
import { ACTIVITY_ACTIONS, ACTIVITY_CONTENT_TYPES, ACTIVITY_TYPES } from '../db/models/definitions/constants';

import './setup.ts';

describe('activityLogQueries', () => {
  const commonParamDefs = `
    $contentType: String!,
    $contentId: String!,
    $activityType: String!,
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

  afterEach(async () => {
    // Clearing test data
    await ActivityLogs.deleteMany({});
  });

  test('Activity log list', async () => {
    const contentType = ACTIVITY_CONTENT_TYPES.CUSTOMER;
    const activityType = ACTIVITY_TYPES.INTERNAL_NOTE;
    const contentId = faker.random.uuid();

    for (let i = 0; i < 3; i++) {
      await activityLogFactory({
        activity: { type: activityType, action: ACTIVITY_ACTIONS.CREATE },
        contentType: { type: contentType, id: contentId },
      });
    }

    const args = { contentType, activityType, contentId };

    const responses = await graphqlRequest(qryActivityLogs, 'activityLogs', args);

    expect(responses.length).toBe(3);

    const responsesWithLimit = await graphqlRequest(qryActivityLogs, 'activityLogs', { ...args, limit: 2 });

    expect(responsesWithLimit.length).toBe(2);
  });
});
