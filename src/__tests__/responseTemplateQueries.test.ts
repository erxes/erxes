import { graphqlRequest } from '../db/connection';
import { responseTemplateFactory } from '../db/factories';
import { ResponseTemplates } from '../db/models';

import './setup.ts';

describe('responseTemplateQueries', () => {
  afterEach(async () => {
    // Clearing test data
    await ResponseTemplates.deleteMany({});
  });

  test('Response templates', async () => {
    // Creating test data
    await responseTemplateFactory();
    await responseTemplateFactory();
    await responseTemplateFactory();

    const qry = `
      query responseTemplates($page: Int, $perPage: Int, $searchValue: String, $brandId: String) {
        responseTemplates(page: $page, perPage: $perPage, searchValue: $searchValue, brandId: $brandId) {
          _id
          name
          brandId
          content

          brand { _id }
          files
        }
      }
    `;

    const response = await graphqlRequest(qry, 'responseTemplates', { page: 1, perPage: 2 });

    expect(response.length).toBe(2);
  });

  test('Get total count of response template', async () => {
    // Creating test data
    await responseTemplateFactory();
    await responseTemplateFactory();
    await responseTemplateFactory();

    const qry = `
      query responseTemplatesTotalCount {
        responseTemplatesTotalCount
      }
    `;

    const response = await graphqlRequest(qry, 'responseTemplatesTotalCount');

    expect(response).toBe(3);
  });
});
