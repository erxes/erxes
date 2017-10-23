/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import formMutations from '../data/resolvers/mutations/forms';
import { userFactory } from '../db/factories';
import { Forms, Users } from '../db/models';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('form and formField mutations', () => {
  const _formId = 'formId';
  let _user;

  beforeEach(async () => {
    _user = await userFactory({});
  });

  afterEach(async () => {
    await Users.remove({});
  });

  test('test if `logging required` error is working as intended', () => {
    expect.assertions(4);

    // Login required ==================
    expect(() => formMutations.formsAdd(null, {}, {})).toThrowError('Login required');
    expect(() => formMutations.formsEdit(null, {}, {})).toThrowError('Login required');
    expect(() => formMutations.formsRemove(null, {}, {})).toThrowError('Login required');
    expect(() => formMutations.formsDuplicate(null, {}, {})).toThrowError('Login required');
  });

  test(`test mutations.formsAdd`, async () => {
    Forms.createForm = jest.fn();

    const doc = {
      title: 'Test form',
      description: 'Test form description',
    };

    await formMutations.formsAdd(null, doc, { user: _user });

    expect(Forms.createForm).toBeCalledWith(doc, _user);
    expect(Forms.createForm.mock.calls.length).toBe(1);
  });

  test('test mutations.formsUpdate', async () => {
    const doc = {
      _id: _formId,
      title: 'Test form 2',
      description: 'Test form description 2',
    };

    Forms.updateForm = jest.fn();

    await formMutations.formsEdit(null, doc, { user: _user });

    const formId = _formId;
    delete doc._id;

    expect(Forms.updateForm).toBeCalledWith(formId, doc);
    expect(Forms.updateForm.mock.calls.length).toBe(1);
  });

  test('test mutations.formsRemove', async () => {
    Forms.removeForm = jest.fn();

    await formMutations.formsRemove(null, { _id: _formId }, { user: _user });

    expect(Forms.removeForm).toBeCalledWith(_formId);
  });

  test('test mutations.formsDuplicate', async () => {
    const fakeId = 'fakeFormid';

    Forms.duplicate = jest.fn();

    await formMutations.formsDuplicate(null, { _id: fakeId }, { user: _user });

    expect(Forms.duplicate).toBeCalledWith(fakeId);
    expect(Forms.duplicate.mock.calls.length).toBe(1);
  });
});
