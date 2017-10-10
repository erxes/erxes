/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { userFactory, formFactory, formFieldFactory, integrationFactory } from '../db/factories';
import { Forms, Users, FormFields } from '../db/models';
import mutations from '../data/resolvers/mutations';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('form creation tests', () => {
  let _user;
  /**
   * Testing with an _user object
   */
  beforeEach(async () => {
    _user = await userFactory({});
  });

  /**
   * Deleting the data that was used in test
   */
  afterEach(async () => {
    await Users.remove({});
    await Forms.remove({});
  });

  test('form creation test without userId supplied', async () => {
    expect.assertions(1);
    try {
      await Forms.createForm({
        title: 'Test form',
        description: 'Test form description',
      });
    } catch (e) {
      expect(e.message).toEqual('createdUserId must be supplied');
    }
  });

  test('form creating tests', async () => {
    let form = await Forms.createForm({
      title: 'Test form',
      description: 'Test form description',
      createdUserId: _user._id,
    });

    form = await Forms.findOne({ _id: form._id });

    expect(form.title).toBe('Test form');
    expect(form.description).toBe('Test form description');
    expect(typeof form.code).toBe('string');
    expect(form.code.length).toEqual(6);
    expect(typeof form.createdDate).toBe('object');
    expect(form.createdUserId).toBe(_user._id);
  });
});

describe('form update tests', () => {
  let _user;
  /**
   * Testing with an _user object
   */
  beforeEach(async () => {
    _user = await userFactory({});
  });

  /**
   * Deleting the data that was used in test
   */
  afterEach(async () => {
    await Users.remove({});
    await Forms.remove({});
  });

  test('form update tests', async () => {
    const form = await Forms.createForm({
      title: 'Test form',
      description: 'Test form description',
      createdUserId: _user._id,
    });

    await Forms.updateForm(form._id, {
      title: 'Test form 2',
      description: 'Test form description 2',
    });

    const formAfterUpdate = await Forms.findOne({ _id: form._id });
    expect(formAfterUpdate.title).toBe('Test form 2');
    expect(formAfterUpdate.description).toBe('Test form description 2');
    expect(form.createdUserId).toBe(formAfterUpdate.createdUserId);
    expect(form.code).toBe(formAfterUpdate.code);
    expect(typeof form.createdDate).toBe('object');
  });
});

describe('form remove tests', async () => {
  let _user;

  /**
   * Testing with an _user object
   */
  beforeEach(async () => {
    _user = await userFactory({});
  });

  /**
   * Deleting the data that was used in test
   */
  afterEach(async () => {
    await Users.remove({});
    await Forms.remove({});
  });

  test('form removal test', async () => {
    const form = await Forms.createForm({
      title: 'Test form',
      description: 'Test form description',
      createdUserId: _user._id,
    });

    await Forms.removeForm(form._id);
    const formCount = await Forms.find({}).count();
    expect(formCount).toBe(0);
  });
});

describe('test exception in form remove', async () => {
  let _user;

  /**
   * Testing with an _user object
   */
  beforeEach(async () => {
    _user = await userFactory({});
  });

  /**
   * Deleting the data that was used in test
   */
  afterEach(async () => {
    await Users.remove({});
    await Forms.remove({});
    await FormFields.remove({});
  });

  test('try to remove form with fields in it', async () => {
    expect.assertions(2);
    const form = await Forms.createForm({
      title: 'Test form',
      description: 'Test form description',
      createdUserId: _user._id,
    });

    await FormFields.createFormField(form._id, {
      type: 'shoutbox',
      validation: 'number',
      text: 'form field text',
      description: 'form field description',
    });

    try {
      await Forms.removeForm(form._id);
    } catch (e) {
      expect(e.message).toEqual('You cannot delete this form. This form has some fields.');
    }

    await FormFields.remove({});

    await integrationFactory({
      formId: form._id,
      formData: {
        loadType: 'shoutbox',
        fromEmail: 'test@erxes.io',
      },
    });

    try {
      await Forms.removeForm(form._id);
    } catch (e) {
      expect(e.message).toEqual('You cannot delete this form. This form used in integration.');
    }
  });
});

describe('add form field test', async () => {
  let _user;
  let _form;
  /**
   * Testing with an _user object and a _form object
   */
  beforeEach(async () => {
    _user = await userFactory({});
    _form = await formFactory({ createdUserId: _user._id });
  });

  /**
   * Deleting the data that was used in test
   */
  afterEach(async () => {
    await Users.remove({});
    await FormFields.remove({});
    await Forms.remove({});
  });

  test('add form field test', async () => {
    const newFormField = await FormFields.createFormField(_form._id, {
      type: 'input',
      validation: 'number',
      text: 'How old are you?',
      description: 'Form field description',
      options: ['This', 'should', 'not', 'be', 'here', 'tho'],
      isRequired: false,
    });

    expect(newFormField.formId).toEqual(_form._id);
    expect(newFormField.order).toEqual(0);
    expect(newFormField.type).toEqual('input');
    expect(newFormField.validation).toEqual('number');
    expect(newFormField.text).toEqual('How old are you?');
    expect(newFormField.description).toEqual('Form field description');
    expect.arrayContaining(newFormField.options);
    expect(newFormField.isRequired).toEqual(false);
  });
});

describe('update form field test', async () => {
  let _user;
  let _form;
  let _form_field;
  /**
   * Testing with an _user object and a _form object
   */
  beforeEach(async () => {
    _user = await userFactory({});
    _form = await formFactory({ createdUserId: _user._id });
    _form_field = await formFieldFactory(_form._id, {});
  });

  /**
   * Deleting the data that was used in test
   */
  afterEach(async () => {
    await Users.remove({});
    await FormFields.remove({});
    await Forms.remove({});
  });

  test('update form field test', async () => {
    let updatedFormField = await FormFields.updateFormField(_form_field._id, {
      type: 'input 1',
      validation: 'number 1',
      text: 'How old are you? 1',
      description: 'Form field description 1',
      options: ['This', 'should', 'not', 'be', 'here', 'tho', '1'],
      isRequired: true,
    });

    updatedFormField = await FormFields.findOne({ _id: _form_field._id });
    expect(updatedFormField.formId).toEqual(_form._id);
    expect(updatedFormField.type).toEqual('input 1');
    expect(updatedFormField.validation).toEqual('number 1');
    expect(updatedFormField.text).toEqual('How old are you? 1');
    expect(updatedFormField.description).toEqual('Form field description 1');
    expect.arrayContaining(updatedFormField.options);
    expect(updatedFormField.options.length).toEqual(7);
    expect(updatedFormField.isRequired).toEqual(true);
  });
});

describe('remove form field test', async () => {
  let _user;
  let _form;
  let _form_field;
  /**
   * Testing with an _user object and a _form object
   */
  beforeEach(async () => {
    _user = await userFactory({});
    _form = await formFactory({ createdUserId: _user._id });
    _form_field = await formFieldFactory(_form._id, {});
  });

  /**
   * Deleting the data that was used in test
   */
  afterEach(async () => {
    await Users.remove({});
    await FormFields.remove({});
    await Forms.remove({});
  });

  test('remove form field test', async () => {
    await FormFields.removeFormField(_form_field._id);
    expect(await FormFields.find({}).count()).toEqual(0);
  });
});

describe('test of update order of form fields', async () => {
  let _user;
  let _form;
  let _form_field;
  let _form_field2;
  let _form_field3;
  /**
   * Testing with an _user object and a _form object with 3 fields in it
   * to test the setting the new order
   */
  beforeEach(async () => {
    _user = await userFactory({});
    _form = await formFactory({ createdUserId: _user._id });
    _form_field = await formFieldFactory(_form._id, {});
    _form_field2 = await formFieldFactory(_form._id, {});
    _form_field3 = await formFieldFactory(_form._id, {});
  });

  /**
   * Deleting the data that was used in test
   */
  afterEach(async () => {
    await Users.remove({});
    await FormFields.remove({});
    await Forms.remove({});
  });

  test('test of update order of form fields', async () => {
    expect(_form_field.order).toBe(0);
    expect(_form_field2.order).toBe(1);
    expect(_form_field3.order).toBe(2);

    const orderDictArray = [
      { id: _form_field3._id, order: 10 },
      { id: _form_field2._id, order: 9 },
      { id: _form_field._id, order: 8 },
    ];

    await Forms.updateFormFieldsOrder(orderDictArray);
    const ff1 = await FormFields.findOne({ _id: _form_field3._id });
    expect(ff1.order).toBe(10);
    expect(ff1.text).toBe(_form_field3.text);

    const ff2 = await FormFields.findOne({ _id: _form_field2._id });
    expect(ff2.order).toBe(9);
    expect(ff2.text).toBe(_form_field2.text);

    const ff3 = await FormFields.findOne({ _id: _form_field._id });
    expect(ff3.order).toBe(8);
    expect(ff3.text).toBe(_form_field.text);
  });
});

describe('test of form duplication', () => {
  let _user;
  let _form;
  /**
   * Testing with an _user object and a _form object with 3 fields in it
   */
  beforeEach(async () => {
    _user = await userFactory({});
    _form = await formFactory({ createdUserId: _user._id });
    await formFieldFactory(_form._id, {});
    await formFieldFactory(_form._id, {});
    await formFieldFactory(_form._id, {});
  });

  /**
   * Deleting the data that was used in test
   */
  afterEach(async () => {
    await Users.remove({});
    await FormFields.remove({});
    await Forms.remove({});
  });

  test('test of form duplication', async () => {
    const duplicatedForm = await Forms.duplicate(_form._id);

    expect(duplicatedForm.title).toBe(`${_form.title} duplicated`);
    expect(duplicatedForm.description).toBe(_form.description);
    expect(typeof duplicatedForm.code).toBe('string');
    expect(duplicatedForm.code.length).toEqual(6);
    expect(duplicatedForm.createdUserId).toBe(_form.createdUserId);

    const formFieldsCount = await FormFields.find({}).count();
    const duplicateFormFieldsCount = await FormFields.find({ formId: duplicatedForm._id }).count();

    expect(formFieldsCount).toEqual(6);
    expect(duplicateFormFieldsCount).toEqual(3);
  });
});

describe('mutations', () => {
  afterEach(async () => {
    await Users.remove({});
    await Forms.remove({});
    await FormFields.remove({});
  });

  test('mutation tests ', async () => {
    const _user = await userFactory({});

    // mutations.formsCreate
    let form = await mutations.formsCreate(null, {
      title: 'Test form',
      description: 'Test form description',
      createdUserId: _user._id,
    });

    form = await Forms.findOne({ _id: form._id });

    expect(form.title).toBe('Test form');
    expect(form.description).toBe('Test form description');
    expect(typeof form.code).toBe('string');
    expect(form.code.length).toEqual(6);
    expect(typeof form.createdDate).toBe('object');
    expect(form.createdUserId).toBe(_user._id);

    // mutations.formsUpdate
    await mutations.formsEdit(null, {
      _id: form._id,
      title: 'Test form 2',
      description: 'Test form description 2',
    });

    const formAfterUpdate = await Forms.findOne({ _id: form._id });
    expect(formAfterUpdate.title).toBe('Test form 2');
    expect(formAfterUpdate.description).toBe('Test form description 2');
    expect(form.createdUserId).toBe(formAfterUpdate.createdUserId);
    expect(form.code).toBe(formAfterUpdate.code);
    expect(typeof form.createdDate).toBe('object');

    // mutations.formsAddFormField
    const newFormField = await mutations.formsAddFormField(null, {
      formId: form._id,
      type: 'input',
      validation: 'number',
      text: 'How old are you?',
      description: 'Form field description',
      options: ['This', 'should', 'not', 'be', 'here', 'tho'],
      isRequired: false,
    });

    expect(newFormField.formId).toEqual(form._id);
    expect(newFormField.order).toEqual(0);
    expect(newFormField.type).toEqual('input');
    expect(newFormField.validation).toEqual('number');
    expect(newFormField.text).toEqual('How old are you?');
    expect(newFormField.description).toEqual('Form field description');
    expect.arrayContaining(newFormField.options);
    expect(newFormField.isRequired).toEqual(false);

    // mutations.formsAddFormField
    await mutations.formsEditFormField(null, {
      _id: newFormField._id,
      type: 'mutation input 1',
      validation: 'mutation number 1',
      text: 'mutation - How old are you? 1',
      description: 'mutation - Form field description 1',
      options: ['This', 'should', 'not', 'be', 'here', 'tho', '1'],
      isRequired: true,
    });

    const updatedFormField = await FormFields.findOne({ _id: newFormField._id });
    expect(updatedFormField.formId).toEqual(form._id);
    expect(updatedFormField.type).toEqual('mutation input 1');
    expect(updatedFormField.validation).toEqual('mutation number 1');
    expect(updatedFormField.text).toEqual('mutation - How old are you? 1');
    expect(updatedFormField.description).toEqual('mutation - Form field description 1');
    expect.arrayContaining(updatedFormField.options);
    expect(updatedFormField.options.length).toEqual(7);
    expect(updatedFormField.isRequired).toEqual(true);

    // formsRemoveFormField
    await mutations.formsRemoveFormField(null, { _id: newFormField._id });

    expect(await FormFields.find({}).count()).toEqual(0);

    // mutations.formsRemove
    await mutations.formsRemove(null, { _id: form._id });

    expect(await Forms.find({}).count()).toEqual(0);
  });
});

describe('mutations 2', async () => {
  let _user;
  let _form;
  let _form_field;
  let _form_field2;
  let _form_field3;
  /**
   * Testing with an _user object and a _form object with 3 fields in it
   * to test the setting the new order
   */
  beforeEach(async () => {
    _user = await userFactory({});
    _form = await formFactory({ createdUserId: _user._id });
    _form_field = await formFieldFactory(_form._id, {});
    _form_field2 = await formFieldFactory(_form._id, {});
    _form_field3 = await formFieldFactory(_form._id, {});
  });

  /**
   * Deleting the data that was used in test
   */
  afterEach(async () => {
    await Users.remove({});
    await FormFields.remove({});
    await Forms.remove({});
  });

  test('test of update order of form fields', async () => {
    expect(_form_field.order).toBe(0);
    expect(_form_field2.order).toBe(1);
    expect(_form_field3.order).toBe(2);

    const orderDictArray = [
      { id: _form_field3._id, order: 10 },
      { id: _form_field2._id, order: 9 },
      { id: _form_field._id, order: 8 },
    ];

    await Forms.updateFormFieldsOrder(orderDictArray);
    const ff1 = await FormFields.findOne({ _id: _form_field3._id });
    expect(ff1.order).toBe(10);
    expect(ff1.text).toBe(_form_field3.text);

    const ff2 = await FormFields.findOne({ _id: _form_field2._id });
    expect(ff2.order).toBe(9);
    expect(ff2.text).toBe(_form_field2.text);

    const ff3 = await FormFields.findOne({ _id: _form_field._id });
    expect(ff3.order).toBe(8);
    expect(ff3.text).toBe(_form_field.text);
  });
});

describe('mutations 3', () => {
  let _user;
  let _form;
  /**
   * Testing with an _user object and a _form object with 3 fields in it
   */
  beforeEach(async () => {
    _user = await userFactory({});
    _form = await formFactory({ createdUserId: _user._id });
    await formFieldFactory(_form._id, {});
    await formFieldFactory(_form._id, {});
    await formFieldFactory(_form._id, {});
  });

  /**
   * Deleting the data that was used in test
   */
  afterEach(async () => {
    await Users.remove({});
    await FormFields.remove({});
    await Forms.remove({});
  });

  test('test of form duplication', async () => {
    const duplicatedForm = await mutations.formsDuplicate(null, { _id: _form._id });

    expect(duplicatedForm.title).toBe(`${_form.title} duplicated`);
    expect(duplicatedForm.description).toBe(_form.description);
    expect(typeof duplicatedForm.code).toBe('string');
    expect(duplicatedForm.code.length).toEqual(6);
    expect(duplicatedForm.createdUserId).toBe(_form.createdUserId);

    const formFieldsCount = await FormFields.find({}).count();
    const duplicateFormFieldsCount = await FormFields.find({ formId: duplicatedForm._id }).count();

    expect(formFieldsCount).toEqual(6);
    expect(duplicateFormFieldsCount).toEqual(3);
  });
});
