/* eslint-env jest */

import { Forms } from '../db/models';
import { graphqlRequest, connect, disconnect } from '../db/connection';
import { formFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('formQueries', () => {
  afterEach(async () => {
    // Clearing test data
    await Forms.remove({});
  });

  test('Forms', async () => {
    // Creating test data
    await formFactory({});
    await formFactory({});
    await formFactory({});

    const args = {
      page: 1,
      perPage: 2,
    };

    const qry = `
      query forms($page: Int $perPage: Int) {
        forms(page: $page perPage: $perPage) {
          _id
          title
          code
          description
          buttonText
          themeColor
          featuredImage
          createdUserId
          createdDate
          viewCount
          contactsGathered
        }
      }
    `;

    const response = await graphqlRequest(qry, 'forms', args);

    expect(response.length).toBe(2);
  });

  test('Form detail', async () => {
    const form = await formFactory({});

    const qry = `
      query formDetail($_id: String!) {
        formDetail(_id: $_id) {
          _id
        }
      }
    `;

    const response = await graphqlRequest(qry, 'formDetail', { _id: form._id });

    expect(response._id).toBe(form._id);
  });

  test('Get total count of form', async () => {
    // Creating test data
    await formFactory({});
    await formFactory({});
    await formFactory({});

    const qry = `
      query formsTotalCount {
        formsTotalCount
      }
    `;

    const response = await graphqlRequest(qry, 'formsTotalCount');

    expect(response).toBe(3);
  });
});
