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
    expect.assertions(3);

    // add email template
    try {
      emailTemplateMutations.emailTemplateAdd(
        {},
        { name: _emailTemplate.name, content: _emailTemplate.content },
        {},
      );
    } catch (e) {
      expect(e.message).toEqual('Login required');
    }

    // update email template
    try {
      await emailTemplateMutations.emailTemplateEdit({}, { _id: _emailTemplate.id }, {});
    } catch (e) {
      expect(e.message).toEqual('Login required');
    }

    // remove email template
    try {
      await emailTemplateMutations.emailTemplateRemove({}, { _id: _emailTemplate.id }, {});
    } catch (e) {
      expect(e.message).toEqual('Login required');
    }
  });

  test('Create email template', async () => {
    EmailTemplates.create = jest.fn();

    const _doc = { name: _emailTemplate.name, content: _emailTemplate.content };

    await emailTemplateMutations.emailTemplateAdd({}, _doc, { user: _user });

    expect(EmailTemplates.create.mock.calls.length).toBe(1);
    expect(EmailTemplates.create).toBeCalledWith(_doc);
  });

  test('Update email template', async () => {
    EmailTemplates.updateEmailTemplate = jest.fn();

    const _doc = { name: _emailTemplate.name, content: _emailTemplate.content };

    await emailTemplateMutations.emailTemplateEdit(
      {},
      { _id: _emailTemplate.id, ..._doc },
      { user: _user },
    );

    expect(EmailTemplates.updateEmailTemplate.mock.calls.length).toBe(1);
    expect(EmailTemplates.updateEmailTemplate).toBeCalledWith(_emailTemplate.id, _doc);
  });

  test('Delete email template', async () => {
    EmailTemplates.removeEmailTemplate = jest.fn();

    await emailTemplateMutations.emailTemplateRemove(
      {},
      { _id: _emailTemplate.id },
      { user: _user },
    );

    expect(EmailTemplates.removeEmailTemplate.mock.calls.length).toBe(1);
    expect(EmailTemplates.removeEmailTemplate).toBeCalledWith(_emailTemplate.id);
  });
});
