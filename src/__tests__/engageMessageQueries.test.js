/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { EngageMessages } from '../db/models';
import { graphqlRequest, connect, disconnect } from '../db/connection';
import { engageMessageFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

const generateData = n => {
  const promises = [];

  let i = 1;

  while (i <= n) {
    promises.push(engageMessageFactory());

    i++;
  }

  return Promise.all(promises);
};

describe('engageQueries', () => {
  afterEach(async () => {
    // Clearing test data
    await EngageMessages.remove({});
  });

  test('Engage messages', async () => {
    // Creating test data
    await generateData(3);

    const query = `
      query engageMessages(
        $kind: String
        $status: String
        $tag: String
        $ids: [String]
      ) {
        engageMessages(
          kind: $kind
          status: $status
          tag: $tag
          ids: $ids
        ) {
          _id
        }
      }
    `;

    const responses = await graphqlRequest(query, 'engageMessages', { kind: 'manual' });

    expect(responses.length).toBe(3);
  });

  test('Engage message detail', async () => {
    const engageMessage = await engageMessageFactory();

    const query = `
      query engageMessageDetail($_id: String) {
        engageMessageDetail(_id: $_id) {
          _id
        }
      }
    `;

    const response = await graphqlRequest(query, 'engageMessageDetail', { _id: engageMessage._id });

    expect(response._id).toBe(engageMessage._id);
  });

  test('Count engage message', async () => {
    // Creating test data
    await generateData(4);

    const query = `
      query engageMessageCounts($name: String! $kind: String $status: String) {
        engageMessageCounts(name: $name kind: $kind status: $status)
      }
    `;

    const response = await graphqlRequest(query, 'engageMessageCounts', { name: 'kind' });

    expect(response.all).toBe(4);
  });

  test('Get total count of engage message', async () => {
    // Creating test data
    await generateData(3);

    const query = `
      query engageMessagesTotalCount {
        engageMessagesTotalCount
      }
    `;

    const response = await graphqlRequest(query, 'engageMessagesTotalCount');

    expect(response).toBe(3);
  });
});
