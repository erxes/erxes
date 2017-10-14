/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { userFactory, formFactory, formFieldFactory, integrationFactory } from '../db/factories';
import { Forms, Users, FormFields, Integrations } from '../db/models';
import toBeType from 'jest-tobetype';

expect.extend(toBeType);

beforeAll(() => connect());
afterAll(() => disconnect());

describe('form creation', () => {
  let _user;

  beforeEach(async () => {
    _user = await userFactory({});
  });

  afterEach(async () => {
    await Users.remove({});
    await Forms.remove({});
  });

  test(`testing if Error('createdUser must be supplied') is throwing as intended`, async () => {
    expect.assertions(1);

    try {
      await Forms.createForm({
        title: 'Test form',
        description: 'Test form description',
      });
    } catch (e) {
      expect(e.message).toEqual('createdUser must be supplied');
    }
  });

  test('check if form creation method is working successfully', async () => {
    let form = await Forms.createForm(
      {
        title: 'Test form',
        description: 'Test form description',
      },
      _user._id,
    );

    form = await Forms.findOne({ _id: form._id });

    expect(form.title).toBe('Test form');
    expect(form.description).toBe('Test form description');
    expect(form.code).toBeType('string');
    expect(form.code.length).toBe(6);
    // typeof form.createdDate is 'object' even though its Date
    expect(form.createdDate).toBeType('object');
    expect(form.createdUserId).toBe(_user._id);
  });
});

describe('form update', () => {
  let _user;
  let _form;

  beforeEach(async () => {
    _user = await userFactory({});
    _form = await formFactory({ createdUserId: _user });
  });

  afterEach(async () => {
    await Users.remove({});
    await Forms.remove({});
  });

  test('check if form update method is working successfully', async () => {
    const doc = {
      title: 'Test form 2',
      description: 'Test form description 2',
    };

    const formAfterUpdate = await Forms.updateForm(_form._id, doc);

    expect(formAfterUpdate.title).toBe(doc.title);
    expect(formAfterUpdate.description).toBe(doc.description);
    expect(formAfterUpdate.createdUserId).toBe(_form.createdUserId);
    expect(formAfterUpdate.code).toBe(_form.code);
    expect(_form.createdDate).toBeType('object');
  });
});

describe('form remove', async () => {
  let _form;

  beforeEach(async () => {
    _form = await formFactory({});
  });

  afterEach(async () => {
    await Forms.remove({});
  });

  test('check if form removal is working successfully', async () => {
    await Forms.removeForm(_form._id);

    const formCount = await Forms.find({}).count();

    expect(formCount).toBe(0);
  });
});

describe('test exception in remove form method', async () => {
  let _user;
  let _form;

  beforeEach(async () => {
    _user = await userFactory({});

    _form = await formFactory({
      title: 'Test form',
      description: 'Test form description',
      createdUserId: _user._id,
    });
  });

  afterEach(async () => {
    await Users.remove({});
    await Forms.remove({});
    await FormFields.remove({});
    await Integrations.remove({});
  });

  test('check if errors are being thrown as intended', async () => {
    expect.assertions(2);

    await formFieldFactory(_form._id, {
      type: 'input',
      validation: 'number',
      text: 'form field text',
      description: 'form field description',
    });

    try {
      await Forms.removeForm(_form._id);
    } catch (e) {
      expect(e.message).toEqual('You cannot delete this form. This form has some fields.');
    }

    await FormFields.remove({});

    await integrationFactory({
      formId: _form._id,
      formData: {
        loadType: 'shoutbox',
        fromEmail: 'test@erxes.io',
      },
    });

    try {
      await Forms.removeForm(_form._id);
    } catch (e) {
      expect(e.message).toEqual('You cannot delete this form. This form used in integration.');
    }
  });
});

describe('add form field', async () => {
  let _user;
  let _form;

  beforeEach(async () => {
    _user = await userFactory({});
    _form = await formFactory({ createdUserId: _user._id });
  });

  afterEach(async () => {
    await Users.remove({});
    await FormFields.remove({});
    await Forms.remove({});
  });

  test('check whether form fields are being created successfully', async () => {
    const doc = {
      type: 'input',
      validation: 'number',
      text: 'How old are you?',
      description: 'Form field description',
      options: ['This', 'should', 'not', 'be', 'here', 'tho'],
      isRequired: false,
    };

    const newFormField = await FormFields.createFormField(_form._id, doc);

    expect(newFormField.formId).toEqual(_form._id);
    expect(newFormField.order).toEqual(0);
    expect(newFormField.type).toEqual(doc.type);
    expect(newFormField.validation).toEqual(doc.validation);
    expect(newFormField.text).toEqual(doc.text);
    expect(newFormField.description).toEqual(doc.description);
    expect(newFormField.options).toEqual(expect.arrayContaining(doc.options));
    expect(newFormField.isRequired).toEqual(doc.isRequired);
  });
});

describe('update form field test', async () => {
  let _user;
  let _form;
  let _form_field;

  beforeEach(async () => {
    _user = await userFactory({});
    _form = await formFactory({ createdUserId: _user._id });
    _form_field = await formFieldFactory(_form._id, {});
  });

  afterEach(async () => {
    await Users.remove({});
    await FormFields.remove({});
    await Forms.remove({});
  });

  test('check whether form fields are being updated successfully', async () => {
    const doc = {
      type: 'textarea',
      validation: 'date',
      text: 'How old are you? 1',
      description: 'Form field description 1',
      options: ['This', 'should', 'not', 'be', 'here', 'tho', '1'],
      isRequired: true,
    };

    const updatedFormField = await FormFields.updateFormField(_form_field._id, doc);

    expect(updatedFormField.formId).toEqual(_form._id);
    expect(updatedFormField.type).toEqual(doc.type);
    expect(updatedFormField.validation).toEqual(doc.validation);
    expect(updatedFormField.text).toEqual(doc.text);
    expect(updatedFormField.description).toEqual(doc.description);
    expect(updatedFormField.isRequired).toBe(doc.isRequired);

    for (let item of doc.options) {
      expect(updatedFormField.options).toContain(item);
    }

    expect(updatedFormField.options.length).toEqual(7);
  });
});

describe('remove form field', async () => {
  let _user;
  let _form;
  let _form_field;

  beforeEach(async () => {
    _user = await userFactory({});
    _form = await formFactory({ createdUserId: _user._id });
    _form_field = await formFieldFactory(_form._id, {});
  });

  afterEach(async () => {
    await Users.remove({});
    await FormFields.remove({});
    await Forms.remove({});
  });

  test('check whether form fields are being removed successfully', async () => {
    await FormFields.removeFormField(_form_field._id);

    expect(await FormFields.find({}).count()).toEqual(0);
  });
});

describe('test of update order of form fields', async () => {
  let _user;
  let _form;
  let _formField;
  let _formField2;
  let _formField3;

  /**
   * Testing with an _user object and a _form object with 3 fields in it
   * to test the setting the new order
   */
  beforeEach(async () => {
    _user = await userFactory({});
    _form = await formFactory({ createdUserId: _user._id });
    _formField = await formFieldFactory(_form._id, {});
    _formField2 = await formFieldFactory(_form._id, {});
    _formField3 = await formFieldFactory(_form._id, {});
  });

  /**
   * Deleting the data that was used in test
   */
  afterEach(async () => {
    await Users.remove({});
    await FormFields.remove({});
    await Forms.remove({});
  });

  test('check whether order values on form fields are being updated successfully', async () => {
    expect(_formField.order).toBe(0);
    expect(_formField2.order).toBe(1);
    expect(_formField3.order).toBe(2);

    const orderDictArray = [
      { _id: _formField3._id, order: 10 },
      { _id: _formField2._id, order: 9 },
      { _id: _formField._id, order: 8 },
    ];

    await Forms.updateFormFieldsOrder(orderDictArray);
    const ff1 = await FormFields.findOne({ _id: _formField3._id });

    expect(ff1.order).toBe(10);
    expect(ff1.text).toBe(_formField3.text);

    const ff2 = await FormFields.findOne({ _id: _formField2._id });

    expect(ff2.order).toBe(9);
    expect(ff2.text).toBe(_formField2.text);

    const ff3 = await FormFields.findOne({ _id: _formField._id });
    expect(ff3.order).toBe(8);
    expect(ff3.text).toBe(_formField.text);
  });
});

describe('form duplication', () => {
  let _user;
  let _form;

  beforeEach(async () => {
    _user = await userFactory({});
    _form = await formFactory({ createdUserId: _user._id });
    await formFieldFactory(_form._id, {});
    await formFieldFactory(_form._id, {});
    await formFieldFactory(_form._id, {});
  });

  afterEach(async () => {
    await Users.remove({});
    await FormFields.remove({});
    await Forms.remove({});
  });

  test('test whether form duplication method is working successfully', async () => {
    const duplicatedForm = await Forms.duplicate(_form._id);

    expect(duplicatedForm.title).toBe(`${_form.title} duplicated`);
    expect(duplicatedForm.description).toBe(_form.description);
    expect(duplicatedForm.code).toBeType('string');
    expect(duplicatedForm.code.length).toEqual(6);
    expect(duplicatedForm.createdUserId).toBe(_form.createdUserId);

    const formFieldsCount = await FormFields.find({}).count();
    const duplicateFormFieldsCount = await FormFields.find({ formId: duplicatedForm._id }).count();

    expect(formFieldsCount).toEqual(6);
    expect(duplicateFormFieldsCount).toEqual(3);
  });
});
