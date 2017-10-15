/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { ResponseTemplates, Users } from '../db/models';
import { responseTemplateFactory, userFactory } from '../db/factories';
import responseTemplateMutations from '../data/resolvers/mutations/responseTemplates';

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

  test('Response templates login required functions', async () => {
    expect.assertions(3);

    // add response template
    try {
      responseTemplateMutations.responseTemplateAdd(
        {},
        { name: _responseTemplate.name, content: _responseTemplate.content },
        {},
      );
    } catch (e) {
      expect(e.message).toEqual('Login required');
    }

    // update response template
    try {
      await responseTemplateMutations.responseTemplateEdit({}, { _id: _responseTemplate.id }, {});
    } catch (e) {
      expect(e.message).toEqual('Login required');
    }

    // remove response template
    try {
      await responseTemplateMutations.responseTemplateRemove({}, { _id: _responseTemplate.id }, {});
    } catch (e) {
      expect(e.message).toEqual('Login required');
    }
  });

  test('Create response template', async () => {
    ResponseTemplates.create = jest.fn();

    const _doc = {
      name: _responseTemplate.name,
      content: _responseTemplate.content,
      brandId: _responseTemplate.brandId,
      files: _responseTemplate.files,
    };

    await responseTemplateMutations.responseTemplateAdd({}, _doc, { user: _user });
    expect(ResponseTemplates.create.mock.calls.length).toBe(1);
    expect(ResponseTemplates.create).toBeCalledWith(_doc);
  });

  test('Update response template', async () => {
    ResponseTemplates.updateResponseTemplate = jest.fn();

    const _doc = {
      name: _responseTemplate.name,
      content: _responseTemplate.content,
      brandId: _responseTemplate.brandId,
      files: _responseTemplate.files,
    };

    await responseTemplateMutations.responseTemplateEdit(
      {},
      { _id: _responseTemplate.id, ..._doc },
      { user: _user },
    );

    expect(ResponseTemplates.updateResponseTemplate.mock.calls.length).toBe(1);
    expect(ResponseTemplates.updateResponseTemplate).toBeCalledWith(_responseTemplate.id, _doc);
  });

  test('Delete response template', async () => {
    ResponseTemplates.removeResponseTemplate = jest.fn();

    await responseTemplateMutations.responseTemplateRemove(
      {},
      { _id: _responseTemplate.id },
      { user: _user },
    );

    expect(ResponseTemplates.removeResponseTemplate.mock.calls.length).toBe(1);
    expect(ResponseTemplates.removeResponseTemplate).toBeCalledWith(_responseTemplate.id);
  });
});
