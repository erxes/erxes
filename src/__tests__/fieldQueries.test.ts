import * as faker from 'faker';
import { connect, disconnect, graphqlRequest } from '../db/connection';
import { fieldFactory, fieldGroupFactory } from '../db/factories';
import { Companies, Customers, Fields, FieldsGroups } from '../db/models';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('fieldQueries', () => {
  afterEach(async () => {
    // Clearing test data
    await Fields.remove({});
    await FieldsGroups.remove({});
  });

  test('Fields', async () => {
    // Creating test data
    const contentTypeId = faker.random.uuid();

    await fieldFactory({ contentType: 'company', contentTypeId });
    await fieldFactory({ contentType: 'customer', contentTypeId });
    await fieldFactory({ contentType: 'company' });
    await fieldFactory({ contentType: 'customer' });

    const qry = `
      query fields($contentType: String! $contentTypeId: String) {
        fields(contentType: $contentType contentTypeId: $contentTypeId) {
          _id
          contentType
          contentTypeId
          type
          validation
          text
          description
          options
          isRequired
          order
          isVisible
          isDefinedByErxes
          groupId
          lastUpdatedUser { _id }
          lastUpdatedUserId
        }
      }
    `;

    // company ===================
    let responses = await graphqlRequest(qry, 'fields', {
      contentType: 'company',
    });

    expect(responses.length).toBe(2);

    // customer ==================
    responses = await graphqlRequest(qry, 'fields', {
      contentType: 'customer',
    });

    expect(responses.length).toBe(2);

    // company with contentTypeId ===
    responses = await graphqlRequest(qry, 'fields', {
      contentType: 'company',
      contentTypeId,
    });

    expect(responses.length).toBe(1);

    // customer with contentTypeId ===
    responses = await graphqlRequest(qry, 'fields', {
      contentType: 'customer',
      contentTypeId,
    });

    expect(responses.length).toBe(1);
  });

  test('Fields combined by content type', async () => {
    // Creating test data
    await fieldFactory({ contentType: 'company' });
    await fieldFactory({ contentType: 'customer' });

    const qry = `
      query fieldsCombinedByContentType($contentType: String!) {
        fieldsCombinedByContentType(contentType: $contentType)
      }
    `;

    // compnay =======================
    let responses = await graphqlRequest(qry, 'fieldsCombinedByContentType', {
      contentType: 'company',
    });

    // getting fields of companies schema
    const companyFields: any = [];
    let responseFields = responses.map(response => response.name);

    Companies.schema.eachPath(path => {
      companyFields.push(path);
    });

    expect(responseFields.name).toBe(companyFields.name);
    expect(responseFields.website).toBe(companyFields.website);

    // customer =======================
    responses = await graphqlRequest(qry, 'fieldsCombinedByContentType', {
      contentType: 'customer',
    });

    // getting fields of customers schema
    const customerFields: any = [];
    responseFields = responses.map(response => response.name);

    Customers.schema.eachPath(path => {
      customerFields.push(path);
    });

    expect(responseFields.firstName).toBe(customerFields.firstName);
    expect(responseFields.lastName).toBe(customerFields.lastName);
  });

  test('Fields default columns config', async () => {
    const qry = `
      query fieldsDefaultColumnsConfig($contentType: String!) {
        fieldsDefaultColumnsConfig(contentType: $contentType) {
          name
        }
      }
    `;

    // get customer default config
    let responses = await graphqlRequest(qry, 'fieldsDefaultColumnsConfig', {
      contentType: 'customer',
    });

    expect(responses.length).toBe(4);
    expect(responses[0].name).toBe('firstName');
    expect(responses[1].name).toBe('lastName');
    expect(responses[2].name).toBe('primaryEmail');
    expect(responses[3].name).toBe('primaryPhone');

    // get company default config
    responses = await graphqlRequest(qry, 'fieldsDefaultColumnsConfig', {
      contentType: 'company',
    });

    expect(responses.length).toBe(7);
    expect(responses[0].name).toBe('primaryName');
    expect(responses[1].name).toBe('size');
    expect(responses[3].name).toBe('industry');
    expect(responses[4].name).toBe('plan');
    expect(responses[5].name).toBe('lastSeenAt');
    expect(responses[6].name).toBe('sessionCount');
  });

  test('Field groups', async () => {
    // Creating test data
    await fieldGroupFactory({ contentType: 'customer' });
    await fieldGroupFactory({ contentType: 'company' });

    const qry = `
      query fieldsGroups($contentType: String) {
        fieldsGroups(contentType: $contentType) {
          _id
        }
      }
    `;

    // customer content type ============
    let responses = await graphqlRequest(qry, 'fieldsGroups', {
      contentType: 'customer',
    });

    expect(responses.length).toBe(1);

    // company content type =============
    responses = await graphqlRequest(qry, 'fieldsGroups', {
      contentType: 'company',
    });

    expect(responses.length).toBe(1);
  });
});
