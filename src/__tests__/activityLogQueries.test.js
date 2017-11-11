/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { COC_CONTENT_TYPES } from '../data/constants';
import mutations from '../data/resolvers/mutations';
import { userFactory, segmentFactory, conversationMessageFactory } from '../db/factories';
import { ActivityLogs } from '../db/models';
import schema from '../data';
import cronJobs from '../cronJobs';

import { graphql } from 'graphql';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('customerActivityLog', () => {
  let _user;
  let _message;

  beforeAll(async () => {
    _user = await userFactory({});
    _message = await conversationMessageFactory({});
  });

  test('customerActivityLog', async () => {
    const customer = await mutations.customersAdd(
      null,
      {
        name: 'test user',
        email: 'test@test.test',
        phone: '123456789',
      },
      { user: _user },
    );

    await mutations.activitivyLogsAddConversationMessageLog(null, {
      customerId: customer._id,
      messageId: _message._id,
    });

    // create internal note
    const internalNote = await mutations.internalNotesAdd(
      null,
      {
        contentType: COC_CONTENT_TYPES.CUSTOMER,
        contentTypeId: customer._id,
        content: 'test internal note',
      },
      { user: _user },
    );

    const nameEqualsConditions = [
      {
        type: 'string',
        dateUnit: 'days',
        value: 'Test user',
        operator: 'e',
        field: 'name',
      },
    ];

    const segment = await segmentFactory({
      contentType: COC_CONTENT_TYPES.CUSTOMER,
      conditions: nameEqualsConditions,
    });

    // create segment log
    await cronJobs.createActivityLogsFromSegments();

    const query = `
      query customerActivityLog($_id: String!) {
        customerActivityLog(_id: $_id) {
          date {
            year
            month
          }
          list {
            id
            action
            content
            createdAt
          }
        }
      }
    `;

    const rootValue = {};
    const context = { user: _user };

    // call graphql query
    let result = await graphql(schema, query, rootValue, context, { _id: customer._id });

    let logs = result.data.customerActivityLog;

    // test values
    expect(logs[0].list[0].id).toBe(segment._id);
    expect(logs[0].list[0].action).toBe('segment-create');
    expect(logs[0].list[0].content).toBe(segment.name);

    expect(logs[0].list[1].id).toBe(internalNote._id);
    expect(logs[0].list[1].action).toBe('internal_note-create');
    expect(logs[0].list[1].content).toBe(internalNote.content);

    expect(logs[0].list[2].id).toBe(_message._id);
    expect(logs[0].list[2].action).toBe('conversation_message-create');
    expect(logs[0].list[2].content).toBe(_message.content);

    expect(logs[0].list[3].id).toBe(customer._id);
    expect(logs[0].list[3].action).toBe('customer-create');
    expect(logs[0].list[3].content).toBe(customer.name);

    // change activity log 'createdAt' values
    await ActivityLogs.update(
      {
        'activity.type': 'segment',
        'activity.action': 'create',
      },
      {
        $set: {
          createdAt: new Date(2017, 0, 1),
        },
      },
    );

    await ActivityLogs.update(
      {
        'activity.type': 'internal_note',
        'activity.action': 'create',
      },
      {
        $set: {
          createdAt: new Date(2017, 1, 1),
        },
      },
    );

    await ActivityLogs.update(
      {
        'activity.type': 'conversation_message',
        'activity.action': 'create',
      },
      {
        $set: {
          createdAt: new Date(2017, 1, 3),
        },
      },
    );

    await ActivityLogs.update(
      {
        'activity.type': 'customer',
        'activity.action': 'create',
      },
      {
        $set: {
          createdAt: new Date(2017, 1, 4),
        },
      },
    );

    // call graphql query
    result = await graphql(schema, query, rootValue, context, { _id: customer._id });

    // get new log
    logs = result.data.customerActivityLog;

    // test freshly list
    const yearMonthLength = logs.length - 1;

    expect(logs[yearMonthLength].list[0].id).toBe(segment._id);
    expect(logs[yearMonthLength].list[0].action).toBe('segment-create');
    expect(logs[yearMonthLength].list[0].content).toBe(segment.name);

    const februaryLogLength = logs[yearMonthLength - 1].list.length - 1;

    expect(logs[yearMonthLength - 1].list[februaryLogLength].id).toBe(internalNote._id);
    expect(logs[yearMonthLength - 1].list[februaryLogLength].action).toBe('internal_note-create');
    expect(logs[yearMonthLength - 1].list[februaryLogLength].content).toBe(internalNote.content);

    expect(logs[yearMonthLength - 1].list[februaryLogLength - 1].id).toBe(_message._id);
    expect(logs[yearMonthLength - 1].list[februaryLogLength - 1].action).toBe(
      'conversation_message-create',
    );
    expect(logs[yearMonthLength - 1].list[februaryLogLength - 1].content).toBe(_message.content);

    expect(logs[yearMonthLength - 1].list[februaryLogLength - 2].id).toBe(customer._id);
    expect(logs[yearMonthLength - 1].list[februaryLogLength - 2].action).toBe('customer-create');
    expect(logs[yearMonthLength - 1].list[februaryLogLength - 2].content).toBe(customer.name);
  });
});
