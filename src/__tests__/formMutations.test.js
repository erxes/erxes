/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import formMutations from '../data/resolvers/mutations/forms';
import { userFactory } from '../db/factories';
import { Forms, Users, FormFields } from '../db/models';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('form and formField mutations', () => {
  const _formId = 'formId';
  const _formFieldId = 'formFieldId';
  let _user;

  beforeEach(async () => {
    _user = await userFactory({});
  });

  afterEach(async () => {
    await Users.remove({});
  });

  test(`test mutations.formsCreate`, async () => {
    Forms.createForm = jest.fn();

    const doc = {
      title: 'Test form',
      description: 'Test form description',
    };

    await formMutations.formsCreate(null, doc, { user: _user });

    expect(Forms.createForm).toBeCalledWith(doc, _user);
    expect(Forms.createForm.mock.calls.length).toBe(1);
  });

  test('test mutations.formUpdate', async () => {
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

  test('test mutations.formsAddFormField', async () => {
    const doc = {
      formId: _formId,
      type: 'input',
      validation: 'number',
      text: 'How old are you?',
      description: 'Form field description',
      options: ['This', 'should', 'not', 'be', 'here', 'tho'],
      isRequired: false,
    };

    FormFields.createFormField = jest.fn();

    await formMutations.formsAddFormField(null, doc, { user: _user });

    delete doc.formId;

    expect(FormFields.createFormField).toBeCalledWith(_formId, doc);
    expect(FormFields.createFormField.mock.calls.length).toBe(1);
  });

  test('test mutations.formsEditFormField', async () => {
    const doc = {
      _id: _formFieldId,
      type: 'mutation input 1',
      validation: 'mutation number 1',
      text: 'mutation - How old are you? 1',
      description: 'mutation - Form field description 1',
      options: ['This', 'should', 'not', 'be', 'here', 'tho', '1'],
      isRequired: true,
    };

    FormFields.updateFormField = jest.fn();

    await formMutations.formsEditFormField(null, doc, { user: _user });

    delete doc._id;

    expect(FormFields.updateFormField).toBeCalledWith(_formFieldId, doc);
    expect(FormFields.updateFormField.mock.calls.length).toBe(1);
  });

  test('test mutations.formsRemoveFormField', async () => {
    FormFields.removeFormField = jest.fn();

    await formMutations.formsRemoveFormField(null, { _id: _formFieldId }, { user: _user });

    expect(FormFields.removeFormField).toBeCalledWith(_formFieldId);
    expect(FormFields.removeFormField.mock.calls.length).toBe(1);

    // test mutations.formsRemove ===========
    Forms.removeForm = jest.fn();

    await formMutations.formsRemove(null, { _id: _formId }, { user: _user });

    expect(Forms.removeForm).toBeCalledWith(_formId);
    expect(Forms.removeForm.mock.calls.length).toBe(1);
  });

  test('test mutations.formsUpdateFormFieldsOrder', async () => {
    const doc = {
      orderDics: [
        {
          _id: 'test form field id',
          order: 10,
        },
        {
          _id: 'test form field id 2',
          order: 11,
        },
        {
          _id: 'test form field id 3',
          order: 12,
        },
      ],
    };

    Forms.updateFormFieldsOrder = jest.fn();

    await formMutations.formsUpdateFormFieldsOrder(null, doc, { user: _user });

    expect(Forms.updateFormFieldsOrder).toBeCalledWith(doc.orderDics);
    expect(Forms.updateFormFieldsOrder.mock.calls.length).toBe(1);
  });

  test('test mutations.formsDuplicate', async () => {
    const fakeId = 'fakeFormid';

    Forms.duplicate = jest.fn();

    await formMutations.formsDuplicate(null, { _id: fakeId }, { user: _user });

    expect(Forms.duplicate).toBeCalledWith(fakeId);
    expect(Forms.duplicate.mock.calls.length).toBe(1);
  });
});
