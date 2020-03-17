import { graphqlRequest } from '../db/connection';
import { brandFactory, responseTemplateFactory, userFactory } from '../db/factories';
import { ResponseTemplates, Users } from '../db/models';

import './setup.ts';

describe('Response template mutations', () => {
  let _responseTemplate;
  let _user;
  let context;

  const commonParamDefs = `
    $brandId: String!
    $name: String!
    $content: String
    $files: JSON
  `;

  const commonParams = `
    brandId: $brandId
    name: $name
    content: $content
    files: $files
  `;

  beforeEach(async () => {
    // Creating test data
    _responseTemplate = await responseTemplateFactory({});
    _user = await userFactory({});

    context = { user: _user };
  });

  afterEach(async () => {
    // Clearing test data
    await ResponseTemplates.deleteMany({});
    await Users.deleteMany({});
  });

  test('Add response template', async () => {
    const args = {
      name: _responseTemplate.name,
      brandId: _responseTemplate.brandId,
      content: _responseTemplate.content,
      files: _responseTemplate.files,
    };

    const mutation = `
      mutation responseTemplatesAdd(${commonParamDefs}) {
        responseTemplatesAdd(${commonParams}) {
          brandId
          name
          content
          files
        }
      }
    `;

    const responseTemplate = await graphqlRequest(mutation, 'responseTemplatesAdd', args, context);

    expect(responseTemplate.name).toBe(args.name);
    expect(responseTemplate.brandId).toBe(args.brandId);
    expect(responseTemplate.content).toBe(args.content);
    expect(responseTemplate.files).toEqual(expect.arrayContaining(args.files));
  });

  test('Edit response template', async () => {
    const brand = await brandFactory();

    const args = {
      _id: _responseTemplate._id,
      brandId: brand._id,
      name: _responseTemplate.name,
      content: _responseTemplate.content,
      files: _responseTemplate.files,
    };

    const mutation = `
      mutation responseTemplatesEdit($_id: String!, ${commonParamDefs}) {
        responseTemplatesEdit(_id: $_id, ${commonParams}) {
          _id
          brandId
          name
          content
          files
        }
      }
    `;

    const responseTemplate = await graphqlRequest(mutation, 'responseTemplatesEdit', args, context);

    expect(responseTemplate._id).toBe(args._id);
    expect(responseTemplate.name).toBe(args.name);
    expect(responseTemplate.brandId).toBe(args.brandId);
    expect(responseTemplate.content).toBe(args.content);
    expect(responseTemplate.files).toEqual(expect.arrayContaining(args.files));
  });

  test('Remove response template', async () => {
    const mutation = `
      mutation responseTemplatesRemove($_id: String!) {
        responseTemplatesRemove(_id: $_id)
      }
    `;

    await graphqlRequest(mutation, 'responseTemplatesRemove', { _id: _responseTemplate._id }, context);

    expect(await ResponseTemplates.findOne({ _id: _responseTemplate._id })).toBe(null);
  });
});
