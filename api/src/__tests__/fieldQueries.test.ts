import * as faker from 'faker';
import * as sinon from 'sinon';
import { graphqlRequest } from '../db/connection';
import {
  brandFactory,
  customerFactory,
  fieldFactory,
  fieldGroupFactory,
  integrationFactory,
  usersGroupFactory
} from '../db/factories';
import { Companies, Customers, Fields, FieldsGroups } from '../db/models';
import * as elk from '../elasticsearch';

import { KIND_CHOICES } from '../db/models/definitions/constants';
import './setup.ts';

describe('fieldQueries', () => {
  afterEach(async () => {
    // Clearing test data
    await Fields.deleteMany({});
    await FieldsGroups.deleteMany({});
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
          name
          _id
          lastUpdatedUser {
            _id
          }
        }
      }
    `;

    // company ===================
    let responses = await graphqlRequest(qry, 'fields', {
      contentType: 'company'
    });

    expect(responses.length).toBe(2);

    // customer ==================
    responses = await graphqlRequest(qry, 'fields', {
      contentType: 'customer'
    });

    expect(responses.length).toBe(2);

    // company with contentTypeId ===
    responses = await graphqlRequest(qry, 'fields', {
      contentType: 'company',
      contentTypeId
    });

    expect(responses.length).toBe(1);

    // customer with contentTypeId ===
    responses = await graphqlRequest(qry, 'fields', {
      contentType: 'customer',
      contentTypeId
    });

    expect(responses.length).toBe(1);
  });

  test('Fields combined by content type', async () => {
    const integ = await integrationFactory({});

    const mock = sinon.stub(elk, 'fetchElk');

    mock.onCall(0).callsFake(() => {
      return Promise.resolve([
        {
          _id: integ._id,
          name: integ.name
        }
      ]);
    });

    mock.onCall(1).callsFake(() => {
      return Promise.resolve([
        {
          _id: integ._id,
          name: integ.name
        }
      ]);
    });

    // Creating test data
    const visibleGroup = await usersGroupFactory({ isVisible: true });
    const invisibleGroup = await usersGroupFactory({ isVisible: false });

    await fieldFactory({ contentType: 'company' });
    await fieldFactory({ contentType: 'company' });
    await fieldFactory({ contentType: 'customer', groupId: visibleGroup._id });
    await fieldFactory({
      contentType: 'customer',
      groupId: invisibleGroup._id
    });

    const qry = `
      query fieldsCombinedByContentType($contentType: String!, $usageType: String) {
        fieldsCombinedByContentType(contentType: $contentType, usageType: $usageType)
      }
    `;

    // compnay =======================
    let responses = await graphqlRequest(qry, 'fieldsCombinedByContentType', {
      contentType: 'company'
    });

    // getting fields of companies schema
    const companyFields: any = [];
    let responseFields = responses.map(response => response.name);

    Companies.schema.eachPath(path => {
      companyFields.push(path);
    });

    expect(responseFields.name).toBe(companyFields.name);

    // customer =======================
    const brand = await brandFactory({});
    const integration = await integrationFactory({
      brandId: brand._id,
      kind: KIND_CHOICES.MESSENGER
    });
    const integration1 = await integrationFactory({
      brandId: brand._id,
      kind: KIND_CHOICES.MESSENGER
    });
    const integration2 = await integrationFactory({
      brandId: brand._id,
      kind: KIND_CHOICES.MESSENGER
    });
    const integration3 = await integrationFactory({
      brandId: brand._id,
      kind: KIND_CHOICES.MESSENGER
    });

    await customerFactory({ integrationId: integration._id });
    await customerFactory({ integrationId: integration1._id });
    await customerFactory({
      integrationId: integration2._id
    });
    await customerFactory({
      integrationId: integration3._id
    });

    responses = await graphqlRequest(qry, 'fieldsCombinedByContentType', {
      contentType: 'customer',
      usageType: 'import'
    });

    responses = await graphqlRequest(qry, 'fieldsCombinedByContentType', {
      contentType: 'customer'
    });

    await graphqlRequest(qry, 'fieldsCombinedByContentType', {
      contentType: 'product'
    });

    // getting fields of customers schema
    responseFields = responses.map(response => response.name);

    const customerFields: any = [];
    Customers.schema.eachPath(path => {
      customerFields.push(path);
    });

    expect(responseFields.firstName).toBe(customerFields.firstName);
    expect(responseFields.lastName).toBe(customerFields.lastName);

    mock.restore();
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
      contentType: 'customer'
    });

    expect(responses.length).toBe(8);
    expect(responses[0].name).toBe('location.country');
    expect(responses[1].name).toBe('firstName');
    expect(responses[2].name).toBe('lastName');
    expect(responses[3].name).toBe('primaryEmail');

    // get company default config
    responses = await graphqlRequest(qry, 'fieldsDefaultColumnsConfig', {
      contentType: 'company'
    });

    expect(responses.length).toBe(7);
    expect(responses[0].name).toBe('primaryName');
    expect(responses[1].name).toBe('size');
    expect(responses[3].name).toBe('industry');
    expect(responses[4].name).toBe('plan');
    expect(responses[5].name).toBe('lastSeenAt');
    expect(responses[6].name).toBe('sessionCount');

    // get product default config
    responses = await graphqlRequest(qry, 'fieldsDefaultColumnsConfig', {
      contentType: 'product'
    });

    expect(responses[0].name).toBe('categoryCode');
    expect(responses[1].name).toBe('code');
    expect(responses[2].name).toBe('name');
  });

  test('Field groups', async () => {
    // Creating test data
    await fieldGroupFactory({
      contentType: 'customer',
      isDefinedByErxes: true,
      order: 2
    });
    await fieldGroupFactory({
      contentType: 'customer',
      isDefinedByErxes: false,
      order: 1
    });
    await fieldGroupFactory({
      contentType: 'customer',
      isDefinedByErxes: false,
      order: 3
    });
    await fieldGroupFactory({
      contentType: 'customer',
      isDefinedByErxes: false
    });
    await fieldGroupFactory({ contentType: 'company' });

    const qry = `
      query fieldsGroups($contentType: String) {
        fieldsGroups(contentType: $contentType) {
          _id
          lastUpdatedUser {
            _id
          }
          order
          fields {
            _id
          }
        }
      }
    `;

    // customer content type ============
    let responses = await graphqlRequest(qry, 'fieldsGroups');

    expect(responses.length).toBe(4);

    // company content type =============
    responses = await graphqlRequest(qry, 'fieldsGroups', {
      contentType: 'company'
    });

    expect(responses.length).toBe(1);
  });

  test('Fields query with isVisible filter', async () => {
    // Creating test data
    await fieldFactory({
      text: 'text1',
      contentType: 'customer',
      visible: true,
      isDefinedByErxes: false
    });
    await fieldFactory({
      text: 'text2',
      contentType: 'customer',
      visible: false,
      isDefinedByErxes: false
    });

    const qry = `
   query fields($contentType: String! $contentTypeId: String, $isVisible: Boolean) {
     fields(contentType: $contentType contentTypeId: $contentTypeId, isVisible: $isVisible) {
       text
       _id
       isVisible
     }
   }
 `;

    const responses = await graphqlRequest(qry, 'fields', {
      contentType: 'customer',
      isVisible: true
    });

    expect(responses.length).toBe(1);
  });

  test('Fields query with associated field', async () => {
    // Creating test data
    const customField = await fieldFactory({
      text: 'text2',
      contentType: 'customer',
      visible: true
    });

    await fieldFactory({
      text: 'text1',
      contentType: 'form',
      visible: true,
      associatedFieldId: customField._id
    });

    const qry = `
   query fields($contentType: String! $contentTypeId: String, $isVisible: Boolean) {
     fields(contentType: $contentType contentTypeId: $contentTypeId, isVisible: $isVisible) {
       text
       _id
       isVisible
       associatedField {
         _id
         text
       }
     }
   }
 `;

    const responses = await graphqlRequest(qry, 'fields', {
      contentType: 'form',
      isVisible: true
    });

    expect(responses.length).toBe(1);

    const field = responses[0];

    expect(field.associatedField._id).toBe(customField._id);
  });

  test('Fields query with groupName', async () => {
    // Creating test data
    const group = await fieldGroupFactory({ contentType: 'form' });

    await fieldFactory({
      text: 'text1',
      contentType: 'form',
      visible: true,
      groupId: (group && group._id) || ''
    });

    const qry = `
    query fields(
      $contentType: String!
      $contentTypeId: String
      $isVisible: Boolean
    ) {
      fields(
        contentType: $contentType
        contentTypeId: $contentTypeId
        isVisible: $isVisible
      ) {
        text
        groupName
        _id
        isVisible
        associatedField {
          _id
          text
        }
      }
    }    
 `;

    const responses = await graphqlRequest(qry, 'fields', {
      contentType: 'form',
      isVisible: true
    });

    expect(responses.length).toBe(1);
    const field = responses[0];
    expect(field.groupName).toBe(group && group.name);
  });

  test('get inbox system fields', async () => {
    // Creating test data
    const customerGroup = await fieldGroupFactory({
      contentType: 'customer',
      isDefinedByErxes: true
    });
    const conversationGroup = await fieldGroupFactory({
      contentType: 'conversation',
      isDefinedByErxes: true
    });
    const deviceGroup = await fieldGroupFactory({
      contentType: 'device',
      isDefinedByErxes: true
    });

    const customerField = await fieldFactory({
      text: 'customer',
      contentType: 'customer',
      visible: true,
      groupId: customerGroup ? customerGroup._id : ''
    });

    const deviceField = await fieldFactory({
      text: 'device',
      contentType: 'device',
      visible: true,
      groupId: deviceGroup ? deviceGroup._id : ''
    });

    const conversationField = await fieldFactory({
      text: 'conversation',
      contentType: 'conversation',
      visible: true,
      groupId: conversationGroup ? conversationGroup._id : ''
    });

    const qry = `
        query fieldsInbox {
          fieldsInbox {
            customer {
              _id
            }
            device {
              _id
            }
            conversation {
              _id
            }
          }
        }
    `;

    const response = await graphqlRequest(qry, 'fieldsInbox', {});

    expect(response).toBeDefined();
    expect(response.customer[0]._id).toEqual(customerField._id);
    expect(response.device[0]._id).toEqual(deviceField._id);
    expect(response.conversation[0]._id).toEqual(conversationField._id);
  });

  test('getSystemFieldsGroup', async () => {
    const customerGroup = await fieldGroupFactory({
      contentType: 'customer',
      isDefinedByErxes: true
    });

    const customerField = await fieldFactory({
      text: 'customer',
      contentType: 'customer',
      visible: true,
      groupId: customerGroup ? customerGroup._id : ''
    });

    const qry = `
    query getSystemFieldsGroup($contentType: String!) {
      getSystemFieldsGroup(contentType: $contentType) {
        _id
        fields {
          _id
        }
      }
    }
    `;

    const response = await graphqlRequest(qry, 'getSystemFieldsGroup', {
      contentType: 'customer'
    });

    expect(response).toBeDefined();
    expect(response._id).toEqual(customerGroup && customerGroup._id);
    expect(response.fields[0]._id).toEqual(customerField._id);
  });
});
