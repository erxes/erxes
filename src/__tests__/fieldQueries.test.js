/* eslint-env jest */

import { Fields, FieldsGroups } from '../db/models';
import { graphqlRequest, connect, disconnect } from '../db/connection';
import { fieldGroupFactory, fieldFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

const generateData = params => {
  const { n, name, args } = params;
  const promises = [];

  let factory;
  let i = 1;

  switch (name) {
    case 'field':
      factory = fieldFactory;
      break;
    case 'group':
      factory = fieldGroupFactory;
      break;
  }

  while (i <= n) {
    promises.push(factory(args));

    i++;
  }

  return Promise.all(promises);
};

describe('fieldQueries', () => {
  afterEach(async () => {
    // Clearing test data
    await Fields.remove({});
    await FieldsGroups.remove({});
  });

  test('Fields', async () => {
    // Creating test data
    await generateData({ n: 3, name: 'field' });

    const field = await fieldFactory();

    const args = {
      contentType: field.contentType,
      contentTypeId: field.contentTypeId,
    };

    const query = `
      query fields($contentType: String! $contentTypeId: String) {
        fields(contentType: $contentType contentTypeId: $contentTypeId) {
          _id
        }
      }
    `;

    const response = await graphqlRequest(query, 'fields', args);

    expect(response.length).toBe(4);
  });

  test('Fields combined by content type', async () => {
    // Creating test data
    await generateData({
      n: 3,
      name: 'field',
      args: { contentType: 'customer' },
    });

    const query = `
      query fieldsCombinedByContentType($contentType: String!) {
        fieldsCombinedByContentType(contentType: $contentType)
      }
    `;

    const fields = await Fields.find({ contentType: 'customer' });

    await graphqlRequest(query, 'fieldsCombinedByContentType', { contentType: 'customer' });

    expect(fields.length).toBe(3);
  });

  test('Fields default columns config', async () => {
    const query = `
      query fieldsDefaultColumnsConfig($contentType: String!) {
        fieldsDefaultColumnsConfig(contentType: $contentType) {
          name
        }
      }
    `;

    const responses = await graphqlRequest(query, 'fieldsDefaultColumnsConfig', {
      contentType: 'customer',
    });

    expect(responses.length).toBe(4);
  });

  test('Field groups', async () => {
    // Creating test data
    await generateData({ n: 3, name: 'group', args: {} });

    const query = `
      query fieldsGroups($contentType: String) {
        fieldsGroups(contentType: $contentType) {
          _id
        }
      }
    `;

    const responses = await graphqlRequest(query, 'fieldsGroups', { contentType: 'customer' });

    expect(responses.length).toBe(3);
  });
});
