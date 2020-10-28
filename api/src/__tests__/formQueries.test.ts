import { graphqlRequest } from '../db/connection';
import { formFactory } from '../db/factories';
import { Fields, FieldsGroups } from '../db/models';

import './setup.ts';

describe('formQueries', () => {
  afterEach(async () => {
    // Clearing test data
    await Fields.deleteMany({});
    await FieldsGroups.deleteMany({});
  });

  test('Forms', async () => {
    // Creating test data

    await formFactory();
    await formFactory();

    const qry = `
      query forms {
        forms {
          _id
          title
          code

          createdUser {
            _id
          }

          fields {
            _id
          }
        }
      }
    `;

    // company ===================
    const responses = await graphqlRequest(qry, 'forms');

    expect(responses.length).toBe(2);
    expect(responses[0].title).toBeDefined();
    expect(responses[0].code).toBeDefined();
  });

  test('formDetail', async () => {
    const form = await formFactory({
      title: 'title',
      code: 'code'
    });

    const qry = `
      query formDetail($_id: String!) {
        formDetail(_id: $_id) {
          _id
          title
          code
          createdUser {
            _id
          }
        }
      }
    `;

    const response = await graphqlRequest(qry, 'formDetail', { _id: form._id });
    expect(response.title).toBe('title');
    expect(response.code).toBe('code');
  });
});
