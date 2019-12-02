import { graphqlRequest } from '../db/connection';
import { brandFactory, responseTemplateFactory } from '../db/factories';
import { Brands, ResponseTemplates } from '../db/models';

import './setup.ts';

describe('responseTemplateQueries', () => {
  let brand;
  let firstResponseTemplate;

  beforeEach(async () => {
    // Clearing test data
    brand = await brandFactory();

    firstResponseTemplate = await responseTemplateFactory({ brandId: brand._id, name: 'first' });
    await responseTemplateFactory({ brandId: brand._id });
    await responseTemplateFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await ResponseTemplates.deleteMany({});
    await Brands.deleteMany({});
  });

  test('Response templates', async () => {
    const qry = `
      query responseTemplates($page: Int, $perPage: Int, $searchValue: String, $brandId: String) {
        responseTemplates(page: $page, perPage: $perPage, searchValue: $searchValue, brandId: $brandId) {
          _id
          brand { _id }
        }
      }
    `;

    let response = await graphqlRequest(qry, 'responseTemplates', { page: 1, perPage: 2 });

    expect(response.length).toBe(2);

    response = await graphqlRequest(qry, 'responseTemplates', { brandId: brand._id });

    expect(response.length).toBe(2);

    response = await graphqlRequest(qry, 'responseTemplates', { searchValue: 'first' });

    expect(response[0]._id).toBe(firstResponseTemplate._id);
  });

  test('Get total count of response template', async () => {
    const qry = `
      query responseTemplatesTotalCount($searchValue: String, $brandId: String) {
        responseTemplatesTotalCount(searchValue: $searchValue, brandId: $brandId)
      }
    `;

    let totalCount = await graphqlRequest(qry, 'responseTemplatesTotalCount');

    expect(totalCount).toBe(3);

    totalCount = await graphqlRequest(qry, 'responseTemplatesTotalCount', { brandId: brand._id });

    expect(totalCount).toBe(2);

    totalCount = await graphqlRequest(qry, 'responseTemplatesTotalCount', { searchValue: 'first' });

    expect(totalCount).toBe(1);
  });
});
