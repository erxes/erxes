/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { EmailTemplates } from '../db/models';
import { graphqlRequest, connect, disconnect } from '../db/connection';
import { emailTemplateFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

const generateData = n => {
  const promises = [];

  let i = 1;

  while (i <= n) {
    promises.push(emailTemplateFactory());

    i++;
  }

  return Promise.all(promises);
};

describe('emailTemplateQueries', () => {
  afterEach(async () => {
    // Clearing test data
    await EmailTemplates.remove({});
  });

  test('Email templates', async () => {
    // Creating test data
    await generateData(3);

    const args = {
      page: 1,
      perPage: 5,
    };

    const query = `
      query emailTemplates($page: Int $perPage: Int) {
        emailTemplates(page: $page perPage: $perPage) {
          _id
        }
      }
    `;

    const response = await graphqlRequest(query, 'emailTemplates', args);

    expect(response.length).toBe(3);
  });

  test('Get email template total count', async () => {
    const query = `
      query emailTemplatesTotalCount {
        emailTemplatesTotalCount
      }
    `;

    // Creating test data
    await generateData(3);

    const response = await graphqlRequest(query, 'emailTemplatesTotalCount');

    expect(response).toBe(3);
  });
});
