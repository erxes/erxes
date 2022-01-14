import widgetMutations from '../data/resolvers/mutations/widgets';
import { graphqlRequest } from '../db/connection';
import {
  customerFactory,
  fieldFactory,
  formFactory,
  integrationFactory
} from '../db/factories';
import { Fields, FieldsGroups, Integrations } from '../db/models';

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

  test('formSubmissions', async () => {
    const form = await formFactory({
      title: 'title',
      code: 'code'
    });
    const field = await fieldFactory({
      type: 'phone',
      contentType: 'form',
      contentTypeId: form._id
    });
    const customer = await customerFactory();

    const integration = await integrationFactory({
      formId: form._id,
      kind: 'lead'
    });

    await widgetMutations.widgetsSaveLead(
      {},
      {
        integrationId: integration._id,
        formId: form._id,
        submissions: [{ _id: field._id, value: '99112233' }],
        browserInfo: {
          currentPageUrl: '/page'
        },
        cachedCustomerId: customer._id
      }
    );

    const qry = `
      query formSubmissions($formId: String){
        formSubmissions(formId: $formId) {
          contentTypeId
          customerId
          customer{
            phone
            firstName
          }
          createdAt
          submissions {
            formFieldId
            value
            submittedAt
          }
        }
      }
    `;

    const response = await graphqlRequest(qry, 'formSubmissions', {
      formId: form._id
    });

    console.log(response);

    expect(response.customerId).toBe(customer._id);
    expect(response.submissions.length).toBe(1);
    expect(response.submissions[0].formFieldId).toBe(field._id);
    expect(response.submissions[0].value).toBe('99112233');
  });
});
