/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import formMutations from '../data/resolvers/mutations/forms';
import { Forms } from '../db/models';
import { ROLES } from '../data/constants';

describe('form and formField mutations', () => {
  const _formId = 'formId';

  const _user = { _id: 'fakeId', role: ROLES.CONTRIBUTOR };
  const _adminUser = { _id: 'fakeId', role: ROLES.ADMIN };

  test(`test if Error('Login required') exception is working as intended`, () => {
    expect.assertions(4);

    // Login required ==================
    expect(() => formMutations.formsAdd(null, {}, {})).toThrowError('Login required');
    expect(() => formMutations.formsEdit(null, {}, {})).toThrowError('Login required');
    expect(() => formMutations.formsRemove(null, {}, {})).toThrowError('Login required');
    expect(() => formMutations.formsDuplicate(null, {}, {})).toThrowError('Login required');
  });

  test(`test if Error('Permission required') exception is working as intended`, () => {
    expect.assertions(3);

    const expectError = async func => {
      try {
        await func(null, {}, { user: _user });
      } catch (e) {
        expect(e.message).toBe('Permission required');
      }
    };

    // Login required ==================
    expectError(formMutations.formsAdd);
    expectError(formMutations.formsEdit);
    expectError(formMutations.formsRemove);
  });

  test(`test mutations.formsAdd`, async () => {
    Forms.createForm = jest.fn();

    const doc = {
      title: 'Test form',
      description: 'Test form description',
    };

    await formMutations.formsAdd(null, doc, { user: _adminUser });

    expect(Forms.createForm).toBeCalledWith(doc, _adminUser);
    expect(Forms.createForm.mock.calls.length).toBe(1);
  });

  test('test mutations.formsUpdate', async () => {
    const doc = {
      _id: _formId,
      title: 'Test form 2',
      description: 'Test form description 2',
    };

    Forms.updateForm = jest.fn();

    await formMutations.formsEdit(null, doc, { user: _adminUser });

    const formId = _formId;
    delete doc._id;

    expect(Forms.updateForm).toBeCalledWith(formId, doc);
    expect(Forms.updateForm.mock.calls.length).toBe(1);
  });

  test('test mutations.formsRemove', async () => {
    Forms.removeForm = jest.fn();

    await formMutations.formsRemove(null, { _id: _formId }, { user: _adminUser });

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
