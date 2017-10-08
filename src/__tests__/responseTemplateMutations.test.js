/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { ResponseTemplates, Users } from '../db/models';
import { responseTemplateFactory, userFactory } from '../db/factories';
import responseTemplateMutations from '../data/resolvers/mutations/responseTemplate';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Response template mutations', () => {
  let _responseTemplate;
  let _user;

  beforeEach(async () => {
    // Creating test data
    _responseTemplate = await responseTemplateFactory();
    _user = await userFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await ResponseTemplates.remove({});
    await Users.remove({});
  });

  test('Create response template', async () => {
    const responseTemplateObj = await responseTemplateMutations.responseTemplateAdd(
      {},
      {
        name: _responseTemplate.name,
        content: _responseTemplate.content,
        brandId: _responseTemplate.brandId,
        files: _responseTemplate.files,
      },
      { user: _user },
    );
    expect(responseTemplateObj).toBeDefined();
    expect(responseTemplateObj.name).toBe(_responseTemplate.name);
    expect(responseTemplateObj.content).toBe(_responseTemplate.content);
    expect(responseTemplateObj.brandId).toBe(_responseTemplate.brandId);
    expect(responseTemplateObj.files[0]).toBe(_responseTemplate.files[0]);

    // login required test
    expect(() =>
      responseTemplateMutations.responseTemplateAdd(
        {},
        { name: _responseTemplate.name, content: _responseTemplate.content },
        {},
      ),
    ).toThrowError('Login required');
  });

  test('Update response template', async () => {
    const responseTemplateObj = await responseTemplateMutations.responseTemplateEdit(
      {},
      {
        _id: _responseTemplate.id,
        name: _responseTemplate.name,
        content: _responseTemplate.content,
        brandId: _responseTemplate.brandId,
        files: _responseTemplate.files,
      },
      { user: _user },
    );
    expect(responseTemplateObj).toBeDefined();
    expect(responseTemplateObj.id).toBe(_responseTemplate.id);
    expect(responseTemplateObj.name).toBe(_responseTemplate.name);
    expect(responseTemplateObj.content).toBe(_responseTemplate.content);
    expect(responseTemplateObj.brandId).toBe(_responseTemplate.brandId);
    expect(responseTemplateObj.files[0]).toBe(_responseTemplate.files[0]);
  });

  test('Update response template login required', async () => {
    expect.assertions(1);
    try {
      await responseTemplateMutations.responseTemplateEdit({}, { _id: _responseTemplate.id }, {});
    } catch (e) {
      expect(e.message).toEqual('Login required');
    }
  });

  test('Delete response template', async () => {
    const deletedObj = await responseTemplateMutations.responseTemplateRemove(
      {},
      { _id: _responseTemplate.id },
      { user: _user },
    );
    expect(deletedObj.id).toBe(_responseTemplate.id);
    const emailTemplateObj = await ResponseTemplates.findOne({ _id: _responseTemplate.id });
    expect(emailTemplateObj).toBeNull();
  });

  test('Delete response template login required', async () => {
    expect.assertions(1);
    try {
      await responseTemplateMutations.responseTemplateRemove({}, { _id: _responseTemplate.id }, {});
    } catch (e) {
      expect(e.message).toEqual('Login required');
    }
  });
});
