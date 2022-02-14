import { graphqlRequest } from '../db/connection';
import { productTemplateFactory } from '../db/factories';
import { ProductTemplates } from '../db/models';
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
      query productTemplates {
        productTemplates {
          _id
          title
          discount
          totalAmount
          description
        }
      }
    `;

    const response = await graphqlRequest(qry, 'productTemplates');

    expect(response.length).toBe(3);
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
});
