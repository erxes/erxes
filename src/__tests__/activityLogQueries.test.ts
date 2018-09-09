import cronJobs from '../cronJobs';
import schema from '../data';
import { COC_CONTENT_TYPES } from '../data/constants';
import mutations from '../data/resolvers/mutations';
import { connect, disconnect } from '../db/connection';
import { conversationFactory, customerFactory, segmentFactory, userFactory } from '../db/factories';
import { ActivityLogs, Customers, Segments } from '../db/models';

import { graphql } from 'graphql';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('activityLogs', () => {
  let _user;
  let _conversation;

  beforeAll(async () => {
    _user = await userFactory({});
    _conversation = await conversationFactory({});
  });

  afterEach(async () => {
    await ActivityLogs.remove({});
    await Customers.remove({});
    await Segments.remove({});
  });

  test('customerActivityLog', async () => {
    // create customer
    const customer = await mutations.customersAdd(
      null,
      {
        firstName: 'firstName',
        primaryEmail: 'test@test.test',
        emails: ['test@test.test'],
        phones: ['123456789'],
      },
      { user: _user },
    );

    expect(await ActivityLogs.find({}).count()).toBe(1);

    // create conversation
    await mutations.activityLogsAddConversationLog(null, {
      customerId: customer._id,
      conversationId: _conversation._id,
    });

    expect(await ActivityLogs.find({}).count()).toBe(2);

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

    expect(await ActivityLogs.find({}).count()).toBe(3);

    const nameEqualsConditions: any = [
      {
        type: 'string',
        dateUnit: 'days',
        value: 'firstName',
        operator: 'c',
        field: 'firstName',
      },
    ];

    const segment = await segmentFactory({
      contentType: COC_CONTENT_TYPES.CUSTOMER,
      conditions: nameEqualsConditions,
    });

    // create segment log
    await cronJobs.createActivityLogsFromSegments();

    expect(await ActivityLogs.find({}).count()).toBe(4);

    const query = `
      query activityLogsCustomer($_id: String!) {
        activityLogsCustomer(_id: $_id) {
          date {
            year
            month
          }
          list {
            id
            action
            content
            createdAt
            by {
              _id
              type
              details {
                avatar
                fullName
              }
            }
          }
        }
      }
    `;

    const rootValue = {};
    const context = { user: _user };

    // call graphql query
    let result = await graphql(schema, query, rootValue, context, {
      _id: customer._id,
    });

    let logs = result.data.activityLogsCustomer;

    // test values ==============
    expect(logs[0].list[0].action).toBe('segment-create');
    expect(logs[0].list[0].id).toBe(segment._id);
    expect(logs[0].list[0].content).toBe(segment.name);

    expect(logs[0].list[1].action).toBe('internal_note-create');
    expect(logs[0].list[1].id).toBe(internalNote._id);
    expect(logs[0].list[1].content).toBe(internalNote.content);

    expect(logs[0].list[2].action).toBe('conversation-create');
    expect(logs[0].list[2].id).toBe(_conversation._id);
    expect(logs[0].list[2].content).toBe(_conversation.content);

    expect(logs[0].list[3].action).toBe('customer-create');
    expect(logs[0].list[3].id).toBe(customer._id);
    expect(logs[0].list[3].content).toBe(`${customer.firstName || ''} ${customer.lastName || ''}`);

    // change activity log 'createdAt' values ===================
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
        'activity.type': 'conversation',
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
    result = await graphql(schema, query, rootValue, context, {
      _id: customer._id,
    });

    // get new log
    logs = result.data.activityLogsCustomer;

    // test the fetched data =============================
    const yearMonthLength = logs.length - 1;

    const customerFullName = `${customer.firstName || ''} ${customer.lastName || ''}`;

    expect(logs[yearMonthLength].list[0].id).toBe(segment._id);
    expect(logs[yearMonthLength].list[0].action).toBe('segment-create');
    expect(logs[yearMonthLength].list[0].content).toBe(segment.name);

    const februaryLogLength = logs[yearMonthLength - 1].list.length - 1;

    expect(logs[yearMonthLength - 1].list[februaryLogLength].id).toBe(internalNote._id);
    expect(logs[yearMonthLength - 1].list[februaryLogLength].action).toBe('internal_note-create');
    expect(logs[yearMonthLength - 1].list[februaryLogLength].content).toBe(internalNote.content);

    expect(logs[yearMonthLength - 1].list[februaryLogLength - 1].id).toBe(_conversation._id);
    expect(logs[yearMonthLength - 1].list[februaryLogLength - 1].action).toBe('conversation-create');
    expect(logs[yearMonthLength - 1].list[februaryLogLength - 1].content).toBe(_conversation.content);

    expect(logs[yearMonthLength - 1].list[februaryLogLength - 2].id).toBe(customer._id);
    expect(logs[yearMonthLength - 1].list[februaryLogLength - 2].action).toBe('customer-create');
    expect(logs[yearMonthLength - 1].list[februaryLogLength - 2].content).toBe(customerFullName);
  });

  test('companyActivityLog', async () => {
    const company = await mutations.companiesAdd(
      null,
      {
        primaryName: 'test company',
        names: ['test company'],
        website: 'test.test.test',
      },
      { user: _user },
    );
    const customer = await customerFactory({ companyIds: [company._id] });

    await mutations.activityLogsAddConversationLog(null, {
      customerId: customer._id,
      conversationId: _conversation._id,
    });

    const query = `
      query activityLogsCompany($_id: String!) {
        activityLogsCompany(_id: $_id) {
          date {
            year
            month
          }
          list {
            id
            action
            content
            createdAt
            by {
              _id
              type
              details {
                avatar
                fullName
              }
            }
          }
        }
      }
    `;

    const rootValue = {};
    const context = { user: _user };

    // call graphql query
    const result = await graphql(schema, query, rootValue, context, {
      _id: company._id,
    });

    const logs = result.data.activityLogsCompany;

    // test values ===========================
    expect(logs[0].list[0].id).toBe(_conversation._id);
    expect(logs[0].list[0].action).toBe('conversation-create');
    expect(logs[0].list[0].content).toBe(_conversation.content);

    expect(logs[0].list[1].id).toBe(company._id);
    expect(logs[0].list[1].action).toBe('company-create');
    expect(logs[0].list[1].content).toBe(company.primaryName);
  });
});
