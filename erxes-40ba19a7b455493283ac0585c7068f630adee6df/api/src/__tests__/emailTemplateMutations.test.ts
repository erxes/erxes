import { graphqlRequest } from '../db/connection';
import { emailTemplateFactory, userFactory } from '../db/factories';
import { EmailTemplates, Users } from '../db/models';

import './setup.ts';

describe('Email template mutations', () => {
  let _emailTemplate;
  let _user;
  let context;

  const commonParamDefs = `
    $name: String!
    $content: String!
  `;

  const commonParams = `
    name: $name
    content: $content
  `;

  beforeEach(async () => {
    // Creating test data
    _emailTemplate = await emailTemplateFactory({});
    _user = await userFactory({});

    context = { user: _user };
  });

  afterEach(async () => {
    // Clearing test data
    await EmailTemplates.deleteMany({});
    await Users.deleteMany({});
  });

  test('Add email template', async () => {
    const args = {
      name: _emailTemplate.name,
      content: _emailTemplate.content
    };

    const mutation = `
      mutation emailTemplatesAdd(${commonParamDefs}) {
        emailTemplatesAdd(${commonParams}) {
          name
          content
        }
      }
    `;

    const emailTemplate = await graphqlRequest(
      mutation,
      'emailTemplatesAdd',
      args,
      context
    );

    expect(emailTemplate.name).toBe(args.name);
    expect(emailTemplate.content).toBe(args.content);
  });

  test('Edit email template', async () => {
    const args = {
      _id: _emailTemplate._id,
      name: _emailTemplate.name,
      content: _emailTemplate.content
    };

    const mutation = `
      mutation emailTemplatesEdit($_id: String!, ${commonParamDefs}) {
        emailTemplatesEdit(_id: $_id, ${commonParams}) {
          _id
          name
          content
        }
      }
    `;

    const emailTemplate = await graphqlRequest(
      mutation,
      'emailTemplatesEdit',
      args,
      context
    );

    expect(emailTemplate._id).toBe(args._id);
    expect(emailTemplate.name).toBe(args.name);
    expect(emailTemplate.content).toBe(args.content);
  });

  test('Remove email template', async () => {
    const mutation = `
      mutation emailTemplatesRemove($_id: String!) {
        emailTemplatesRemove(_id: $_id)
      }
    `;

    await graphqlRequest(
      mutation,
      'emailTemplatesRemove',
      { _id: _emailTemplate._id },
      context
    );

    expect(await EmailTemplates.findOne({ _id: _emailTemplate._id })).toBe(
      null
    );
  });
});
