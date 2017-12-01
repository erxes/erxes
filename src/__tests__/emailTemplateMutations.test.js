/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { EmailTemplates, Users } from '../db/models';
import { emailTemplateFactory, userFactory } from '../db/factories';
import emailTemplateMutations from '../data/resolvers/mutations/emailTemplates';

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

  test('Email templates login required functions', async () => {
    const checkLogin = async (fn, args) => {
      try {
        await fn({}, args, {});
      } catch (e) {
        expect(e.message).toEqual('Login required');
      }
    };

    expect.assertions(3);

    // add email template
    checkLogin(emailTemplateMutations.emailTemplatesAdd, {
      name: _emailTemplate.name,
      content: _emailTemplate.content,
    });

    // update email template
    checkLogin(emailTemplateMutations.emailTemplatesEdit, { _id: _emailTemplate.id });

    // remove email template
    checkLogin(emailTemplateMutations.emailTemplatesRemove, { _id: _emailTemplate.id });
  });

  test('Create email template', async () => {
    EmailTemplates.create = jest.fn();

    const _doc = { name: _emailTemplate.name, content: _emailTemplate.content };

    await emailTemplateMutations.emailTemplatesAdd({}, _doc, { user: _user });

    expect(EmailTemplates.create.mock.calls.length).toBe(1);
    expect(EmailTemplates.create).toBeCalledWith(_doc);
  });

  test('Update email template', async () => {
    EmailTemplates.updateEmailTemplate = jest.fn();

    const _doc = { name: _emailTemplate.name, content: _emailTemplate.content };

    await emailTemplateMutations.emailTemplatesEdit(
      {},
      { _id: _emailTemplate.id, ..._doc },
      { user: _user },
    );

    expect(EmailTemplates.updateEmailTemplate.mock.calls.length).toBe(1);
    expect(EmailTemplates.updateEmailTemplate).toBeCalledWith(_emailTemplate.id, _doc);
  });

  test('Delete email template', async () => {
    EmailTemplates.removeEmailTemplate = jest.fn();

    await emailTemplateMutations.emailTemplatesRemove(
      {},
      { _id: _emailTemplate.id },
      { user: _user },
    );

    expect(EmailTemplates.removeEmailTemplate.mock.calls.length).toBe(1);
    expect(EmailTemplates.removeEmailTemplate).toBeCalledWith(_emailTemplate.id);
  });
});
