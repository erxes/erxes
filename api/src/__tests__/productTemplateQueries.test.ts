import { graphqlRequest } from '../db/connection';
import { productTemplateFactory, tagsFactory } from '../db/factories';
import { ProductTemplates } from '../db/models';
import { TAG_TYPES } from '../db/models/definitions/constants';

import './setup.ts';

describe('productTemplateQueries', () => {
  afterEach(async () => {
    // Clearing test data
    await ProductTemplates.deleteMany({});
  });

  test('Product templates', async () => {
    await productTemplateFactory();
    await productTemplateFactory();
    await productTemplateFactory();

    const qry = `
      query productTemplates($page: Int, $perPage: Int, $status: String, $searchValue: String, $tag: String) {
        productTemplates(page: $page, perPage: $perPage, status: $status, searchValue: $searchValue, tag: $tag) {
          _id
          title
          discount
          totalAmount
          description
          templateItems
          templateItemsProduct
          tags {
            _id
          }
        }
      }
    `;

    const responseStatus = await graphqlRequest(qry, 'productTemplates', {
      status: 'active'
    });

    expect(responseStatus.length).toBe(3);

    const responseSearchValue = await graphqlRequest(qry, 'productTemplates', {
      searchValue: 'fake value'
    });

    expect(responseSearchValue.length).toBe(0);

    const responseTag = await graphqlRequest(qry, 'productTemplates', {
      tag: 'fake value'
    });

    expect(responseTag.length).toBe(0);

    const responsePagination = await graphqlRequest(qry, 'productTemplates', {
      page: 2,
      perPage: 2
    });

    expect(responsePagination.length).toBe(1);
  });

  test('Product templateDetail', async () => {
    await productTemplateFactory();

    const qry = `
      query productTemplateDetail($_id: String) {
        productTemplateDetail(_id: $_id) {
          _id
        }
      }
    `;

    const response = await graphqlRequest(qry, 'productTemplateDetail', {
      _id: 'fakeId'
    });

    expect(!response).toBeTruthy();
  });

  test('Product template total count', async () => {
    await productTemplateFactory();
    await productTemplateFactory();
    await productTemplateFactory();
    await productTemplateFactory();

    const qry = `
      query productTemplateTotalCount {
        productTemplateTotalCount
      }
    `;

    const response = await graphqlRequest(qry, 'productTemplateTotalCount');

    expect(response).toBe(4);
  });

  test('Product template count by tag', async () => {
    const tag1 = await tagsFactory({ type: TAG_TYPES.PRODUCT_TEMPLATE });
    const tag2 = await tagsFactory({ type: TAG_TYPES.PRODUCT_TEMPLATE });

    const qry = `
      query productTemplateCountByTags {
        productTemplateCountByTags
      }
    `;

    await productTemplateFactory({ tagIds: [tag1._id, tag2._id] });
    await productTemplateFactory({ tagIds: [tag2._id] });
    await productTemplateFactory({ tagIds: [tag1._id, tag2._id] });

    const response = await graphqlRequest(qry, 'productTemplateCountByTags');

    expect(response[tag1._id]).toBe(2);
    expect(response[tag2._id]).toBe(3);
  });
});
