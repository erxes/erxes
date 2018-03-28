/* eslint-env jest */

import { ResponseTemplates } from '../db/models';
import { graphqlRequest, connect, disconnect } from '../db/connection';
import { responseTemplateFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

const generateData = n => {
  const promises = [];

  let i = 1;

  while (i <= n) {
    promises.push(responseTemplateFactory());

    i++;
  }

  return Promise.all(promises);
};

describe('responseTemplateQueries', () => {
  afterEach(async () => {
    // Clearing test data
    await ResponseTemplates.remove({});
  });

  test('Response templates', async () => {
    // Creating test data
    await generateData(3);

    const query = `
      query responseTemplates($page: Int $perPage: Int) {
        responseTemplates(page: $page perPage: $perPage) {
          _id
        }
      }
    `;

    const response = await graphqlRequest(query, 'responseTemplates', { page: 1, perPage: 5 });

    expect(response.length).toBe(3);
  });

  test('Get total count of response template', async () => {
    // Creating test data
    await generateData(3);

    const query = `
      query responseTemplatesTotalCount {
        responseTemplatesTotalCount
      }
    `;

    const response = await graphqlRequest(query, 'responseTemplatesTotalCount');

    expect(response).toBe(3);
  });
});
