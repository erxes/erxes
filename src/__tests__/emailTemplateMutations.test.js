/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { EmailTemplates, Users } from '../db/models';
import { emailTemplateFactory, userFactory } from '../db/factories';
import emailTemplateMutations from '../data/resolvers/mutations/emailTemplate';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Email template mutations', () => {
  let _emailTemplate;
  let _user;

  beforeEach(async () => {
    // Creating test data
    _emailTemplate = await emailTemplateFactory();
    _user = await userFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await EmailTemplates.remove({});
    await Users.remove({});
  });

  test('Create email template', async () => {
    const emailTemplateObj = await emailTemplateMutations.emailTemplateAdd(
      {},
      { name: _emailTemplate.name, content: _emailTemplate.content },
      { user: _user },
    );
    expect(emailTemplateObj).toBeDefined();
    expect(emailTemplateObj.name).toBe(_emailTemplate.name);
    expect(emailTemplateObj.content).toBe(_emailTemplate.content);

    // Login required test
    expect(() =>
      emailTemplateMutations.emailTemplateAdd(
        {},
        { name: _emailTemplate.name, content: _emailTemplate.content },
        {},
      ),
    ).toThrowError('Login required');
  });

  test('Update email template', async () => {
    const emailTemplateObj = await emailTemplateMutations.emailTemplateEdit(
      {},
      { _id: _emailTemplate.id, name: _emailTemplate.name, content: _emailTemplate.content },
      { user: _user },
    );
    expect(emailTemplateObj).toBeDefined();
    expect(emailTemplateObj.id).toBe(_emailTemplate.id);
    expect(emailTemplateObj.name).toBe(_emailTemplate.name);
    expect(emailTemplateObj.content).toBe(_emailTemplate.content);
  });

  test('Update email template login required', async () => {
    expect.assertions(1);
    try {
      await emailTemplateMutations.emailTemplateEdit({}, { _id: _emailTemplate.id }, {});
    } catch (e) {
      expect(e.message).toEqual('Login required');
    }
  });

  test('Delete email template', async () => {
    const deletedObj = await emailTemplateMutations.emailTemplateRemove(
      {},
      { _id: _emailTemplate.id },
      { user: _user },
    );
    expect(deletedObj.id).toBe(_emailTemplate.id);
    const emailTemplateObj = await EmailTemplates.findOne({ _id: _emailTemplate.id });
    expect(emailTemplateObj).toBeNull();
  });

  test('Delete email template login required', async () => {
    expect.assertions(1);
    try {
      await emailTemplateMutations.emailTemplateRemove({}, { _id: _emailTemplate.id }, {});
    } catch (e) {
      expect(e.message).toEqual('Login required');
    }
  });
});
