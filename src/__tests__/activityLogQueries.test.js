/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { COC_CONTENT_TYPES } from '../data/constants';
import mutations from '../data/resolvers/mutations';
import { userFactory, segmentFactory, conversationMessageFactory } from '../db/factories';
import schema from '../data';
import cronJobs from '../cronJobs';

import { graphql } from 'graphql';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('customerActivityLog', () => {
  let _user;
  let _customer;
  let _message;

  beforeAll(async () => {
    _user = await userFactory({});
    _customer = await mutations.customersAdd(
      null,
      {
        name: 'test user',
        email: 'test@test.test',
        phone: '123456789',
      },
      { user: _user },
    );
    _message = await conversationMessageFactory({});
  });

  test('customerActivityLog', async () => {
    await mutations.activitivyLogsAddConversationMessageLog(null, {
      customerId: _customer._id,
      messageId: _message._id,
    });

    // create internal note
    await mutations.internalNotesAdd(
      null,
      {
        contentType: COC_CONTENT_TYPES.CUSTOMER,
        contentTypeId: _customer._id,
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

    await segmentFactory({
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
            content {
              name
            }
            createdAt
          }
        }
      }
    `;

    const rootValue = {};
    const context = { user: _user };

    const result = await graphql(schema, query, rootValue, context, { _id: _customer._id });

    // TODO: test values

    // TODO: change activity log 'createdAt' values

    // TODO: test again
    // console.log("result: ", result);
    for (let item of result.data.customerActivityLog) {
      console.log('item: ', item);
      // console.log('item.date: ', item.date);
      // console.log('item.list: ', item.list);
    }
  });
});
