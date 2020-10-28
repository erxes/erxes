import * as toBeType from 'jest-tobetype';
import {
  customerFactory,
  fieldFactory,
  formFactory,
  userFactory
} from '../db/factories';
import { Customers, Fields, Forms, FormSubmissions, Users } from '../db/models';

import { FORM_TYPES } from '../db/models/definitions/constants';
import './setup.ts';

expect.extend(toBeType);

describe('form creation', () => {
  let _user;

  beforeEach(async () => {
    _user = await userFactory({});
  });

  afterEach(async () => {
    await Users.deleteMany({});
    await Forms.deleteMany({});
  });

  test('check if form creation method is working successfully', async () => {
    const form = await Forms.createForm(
      {
        title: 'Test form',
        description: 'Test form description',
        type: FORM_TYPES.GROWTH_HACK
      },
      _user._id
    );

    expect(form.title).toBe('Test form');
    expect(form.description).toBe('Test form description');
    expect(form.createdDate).toBeDefined();
    expect(form.createdUserId).toBe(_user._id);
  });
});

test('Get form', async () => {
  const form = await formFactory();

  try {
    await Forms.getForm('fakeId');
  } catch (e) {
    expect(e.message).toBe('Form not found');
  }

  const response = await Forms.getForm(form._id);

  expect(response).toBeDefined();
});

describe('form update', () => {
  let _user;
  let _form;

  beforeEach(async () => {
    _user = await userFactory({});
    _form = await formFactory({ createdUserId: _user });
  });

  afterEach(async () => {
    await Users.deleteMany({});
    await Forms.deleteMany({});
  });

  test('check if form update method is working successfully', async () => {
    const doc = {
      title: 'Test form 2',
      description: 'Test form description 2',
      type: FORM_TYPES.GROWTH_HACK
    };

    const formAfterUpdate = await Forms.updateForm(_form._id, doc);

    expect(formAfterUpdate.title).toBe(doc.title);
    expect(formAfterUpdate.description).toBe(doc.description);
    expect(formAfterUpdate.createdUserId).toBe(_form.createdUserId);
    expect(formAfterUpdate.code).toBe(_form.code);
    expect(_form.createdDate).toBeDefined();
  });
});

describe('form remove', () => {
  let _form;

  beforeEach(async () => {
    _form = await formFactory({});
  });

  afterEach(async () => {
    await Forms.deleteMany({});
    await Fields.deleteMany({});
    await Customers.deleteMany({});
    await FormSubmissions.deleteMany({});
  });

  test('check if form removal is working successfully', async () => {
    const customer = await customerFactory({});

    await fieldFactory({
      contentType: 'customer',
      contentTypeId: customer._id
    });
    await fieldFactory({ contentType: 'form', contentTypeId: _form._id });
    await fieldFactory({ contentType: 'form', contentTypeId: _form._id });
    await fieldFactory({ contentType: 'form', contentTypeId: _form._id });

    await Forms.removeForm(_form._id);

    const formCount = await Forms.find({}).countDocuments();
    const fieldsCount = await Fields.find({}).countDocuments();

    expect(formCount).toBe(0);
    expect(fieldsCount).toBe(1);
  });
});

describe('form duplication', () => {
  let _user;
  let _form;

  beforeEach(async () => {
    _user = await userFactory({});
    _form = await formFactory({ createdUserId: _user._id });
    await fieldFactory({ contentTypeId: _form._id });
    await fieldFactory({ contentTypeId: _form._id });
    await fieldFactory({ contentTypeId: _form._id });
  });

  afterEach(async () => {
    await Users.deleteMany({});
    await Fields.deleteMany({});
    await Forms.deleteMany({});
  });

  test('test whether form duplication method is working successfully', async () => {
    const duplicatedForm = await Forms.duplicate(_form._id);

    if (!duplicatedForm || !duplicatedForm.code) {
      throw new Error('Form not found');
    }

    expect(duplicatedForm.title).toBe(`${_form.title} duplicated`);
    expect(duplicatedForm.description).toBe(_form.description);
    expect(duplicatedForm.code.length).toEqual(6);
    expect(duplicatedForm.createdUserId).toBe(_form.createdUserId);

    const fieldsCount = await Fields.find({}).countDocuments();

    const duplicatedFieldsCount = await Fields.find({
      contentType: 'form',
      contentTypeId: duplicatedForm._id
    }).countDocuments();

    expect(fieldsCount).toEqual(6);
    expect(duplicatedFieldsCount).toEqual(3);
  });

  test('check if formSubmission creation method is working successfully', async () => {
    const customer = await customerFactory({});

    const formSubmission = await FormSubmissions.createFormSubmission({
      customerId: customer._id,
      formId: _form._id
    });

    const formSubmissionObj = await FormSubmissions.findOne({
      _id: formSubmission._id
    });

    if (!formSubmissionObj) {
      throw new Error('Form submission not found');
    }

    expect(formSubmissionObj.customerId).toBe(customer._id);
    expect(formSubmissionObj.formId).toBe(_form._id);
  });

  const formId = 'DFDFDAFD';
  const contentTypeId = formId;

  test('validate', async () => {
    // not submitted field
    await fieldFactory({
      contentTypeId
    });

    const requiredField = await fieldFactory({
      contentTypeId,
      isRequired: true
    });

    const emailField = await fieldFactory({
      contentTypeId,
      validation: 'email'
    });

    const phoneField = await fieldFactory({
      contentTypeId,
      validation: 'phone'
    });

    const validPhoneField = await fieldFactory({
      contentTypeId,
      validation: 'phone'
    });

    const numberField = await fieldFactory({
      contentTypeId,
      validation: 'number'
    });

    const validNumberField = await fieldFactory({
      contentTypeId,
      validation: 'number'
    });

    const validDateField = await fieldFactory({
      contentTypeId,
      validation: 'date'
    });

    const dateField = await fieldFactory({
      contentTypeId,
      validation: 'date'
    });

    const submissions = [
      { _id: requiredField._id, value: null },
      { _id: emailField._id, value: 'email', validation: 'email' },
      { _id: phoneField._id, value: 'phone', validation: 'phone' },
      { _id: validPhoneField._id, value: '88183943', validation: 'phone' },
      { _id: numberField._id, value: 'number', validation: 'number' },
      { _id: validNumberField._id, value: 10, validation: 'number' },
      { _id: dateField._id, value: 'date', validation: 'date' },
      { _id: validDateField._id, value: '2012-09-01', validation: 'date' }
    ];

    // call function
    const errors = await Forms.validate(formId, submissions);

    // must be 4 error
    expect(errors.length).toEqual(5);

    const [
      requiredError,
      emailError,
      phoneError,
      numberError,
      dateError
    ] = errors;

    // required
    expect(requiredError.fieldId).toEqual(requiredField._id);
    expect(requiredError.code).toEqual('required');

    // email
    expect(emailError.fieldId).toEqual(emailField._id);
    expect(emailError.code).toEqual('invalidEmail');

    // phone
    expect(phoneError.fieldId).toEqual(phoneField._id);
    expect(phoneError.code).toEqual('invalidPhone');

    // number
    expect(numberError.fieldId).toEqual(numberField._id);
    expect(numberError.code).toEqual('invalidNumber');

    // date
    expect(dateError.fieldId).toEqual(dateField._id);
    expect(dateError.code).toEqual('invalidDate');
  });
});
