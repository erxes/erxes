import { graphqlRequest } from '../db/connection';
import { emailTemplateFactory } from '../db/factories';
import { EmailTemplates } from '../db/models';

import './setup.ts';

describe('emailTemplateQueries', () => {
  afterEach(async () => {
    // Clearing test data
    await EmailTemplates.deleteMany({});
  });

  test('Email templates', async () => {
    // Creating test data
    await emailTemplateFactory();
    await emailTemplateFactory();
    await emailTemplateFactory();

    const args = {
      page: 1,
      perPage: 2
    };

    const qry = `
      query emailTemplates($page: Int $perPage: Int $searchValue: String $status: String) {
        emailTemplates(page: $page perPage: $perPage searchValue: $searchValue status: $status) {
          _id
        }
      }
    `;

    const response = await graphqlRequest(qry, 'emailTemplates', args);

    expect(response.length).toBe(2);

    const responseSearchValue = await graphqlRequest(qry, 'emailTemplates', {
      searchValue: 'fake value'
    });

    expect(responseSearchValue.length).toBe(0);

    const responseStatus = await graphqlRequest(qry, 'emailTemplates', {
      status: 'active'
    });

    expect(responseStatus.length).toBe(3);
  });

  test('Get email template total count', async () => {
    const qry = `
      query emailTemplatesTotalCount {
        emailTemplatesTotalCount
      }
    `;

    // Creating test data
    await emailTemplateFactory();
    await emailTemplateFactory();
    await emailTemplateFactory();

    const response = await graphqlRequest(qry, 'emailTemplatesTotalCount');

    expect(response).toBe(3);
  });
});
