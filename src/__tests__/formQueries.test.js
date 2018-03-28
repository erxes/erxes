/* eslint-env jest */

import { Forms } from '../db/models';
import { graphqlRequest, connect, disconnect } from '../db/connection';
import { formFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

const generateData = n => {
  const promises = [];

  let i = 1;

  while (i <= n) {
    promises.push(formFactory({}));

    i++;
  }

  return Promise.all(promises);
};

describe('formQueries', () => {
  afterEach(async () => {
    // Clearing test data
    await Forms.remove({});
  });

  test('Forms', async () => {
    // Creating test data
    await generateData(3);

    const args = {
      page: 1,
      perPage: 5,
    };

    const query = `
      query forms($page: Int $perPage: Int) {
        forms(page: $page perPage: $perPage) {
          _id
        }
      }
    `;

    const response = await graphqlRequest(query, 'forms', args);

    expect(response.length).toBe(3);
  });

  test('Form detail', async () => {
    const form = await formFactory({});

    const query = `
      query formDetail($_id: String!) {
        formDetail(_id: $_id) {
          _id
        }
      }
    `;

    const response = await graphqlRequest(query, 'formDetail', { _id: form._id });

    expect(response._id).toBe(form._id);
  });

  test('Get total count of form', async () => {
    // Creating test data
    await generateData(3);

    const query = `
      query formsTotalCount {
        formsTotalCount
      }
    `;

    const response = await graphqlRequest(query, 'formsTotalCount');

    expect(response).toBe(3);
  });
});
