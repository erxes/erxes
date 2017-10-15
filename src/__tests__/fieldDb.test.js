/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Fields } from '../db/models';
import { formFactory, fieldFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

/**
 * Field related tests
 */
describe('Fields', () => {
  let _field;

  beforeEach(async () => {
    // creating field with contentType other than customer
    _field = await fieldFactory({ contentType: 'form', order: 1 });
  });

  afterEach(() => {
    // Clearing test fields
    return Fields.remove({});
  });

  test('createField() without contentTypeId', async () => {
    // first attempt
    let field = await Fields.createField({ contentType: 'customer' });
    expect(field.order).toBe(0);

    // second attempt
    field = await Fields.createField({ contentType: 'customer' });
    expect(field.order).toBe(1);

    // third attempt
    field = await Fields.createField({ contentType: 'customer' });
    expect(field.order).toBe(2);
  });

  test('createField() with contentTypeId', async () => {
    const contentType = 'form';
    const form1 = await formFactory({});
    const form2 = await formFactory({});

    // first attempt
    let field = await Fields.createField({ contentType, contentTypeId: form1._id });
    expect(field.order).toBe(0);

    // second attempt
    field = await Fields.createField({ contentType, contentTypeId: form1._id });
    expect(field.order).toBe(1);

    // must create new order
    field = await Fields.createField({ contentType, contentTypeId: form2._id });
    expect(field.order).toBe(0);
  });

  test('createField() required contentTypeId when form', async () => {
    expect.assertions(1);

    try {
      await Fields.createField({ contentType: 'form' });
    } catch (e) {
      expect(e.message).toEqual('Content type id is required');
    }
  });

  test('createField() check contentTypeId existence', async () => {
    expect.assertions(1);

    try {
      await Fields.createField({ contentType: 'form', contentTypeId: 'DFAFDFADS' });
    } catch (e) {
      expect(e.message).toEqual('Form not found with _id of DFAFDFADS');
    }
  });

  test('updateOrder()', async () => {
    const field1 = await fieldFactory();
    const field2 = await fieldFactory();

    const [updatedField1, updatedField2] = await Fields.updateOrder([
      { _id: field1._id, order: 10 },
      { _id: field2._id, order: 11 },
    ]);

    expect(updatedField1.order).toBe(10);
    expect(updatedField2.order).toBe(11);
  });

  test('Update field valid', async () => {
    const doc = await fieldFactory();

    doc._id = undefined;

    const fieldObj = await Fields.updateField(_field._id, doc);

    // check updates
    expect(fieldObj.contentType).toBe(doc.contentType);
    expect(fieldObj.contentTypeId).toBe(doc.contentTypeId);
    expect(fieldObj.type).toBe(doc.type);
    expect(fieldObj.validation).toBe(doc.validation);
    expect(fieldObj.text).toBe(doc.text);
    expect(fieldObj.description).toBe(doc.description);
    expect(fieldObj.options).toEqual(expect.arrayContaining(doc.options));
    expect(fieldObj.isRequired).toBe(doc.isRequired);
    expect(fieldObj.order).toBe(doc.order);
  });

  test('Remove field valid', async () => {
    expect.assertions(3);

    try {
      await Fields.removeField('DFFFDSFD');
    } catch (e) {
      expect(e.message).toBe('Field not found with id DFFFDSFD');
    }

    const fieldDeletedObj = await Fields.removeField({ _id: _field.id });

    expect(fieldDeletedObj.id).toBe(_field.id);

    const fieldObj = await Fields.findOne({ _id: _field.id });
    expect(fieldObj).toBeNull();
  });

  test('Validate submission: invalid values', async () => {
    expect.assertions(4);

    const expectError = async (message, value) => {
      try {
        await Fields.validate({ _id: _field._id, value });
      } catch (e) {
        expect(e.message).toBe(`${_field.text}: ${message}`);
      }
    };

    const changeValidation = validation => {
      _field.validation = validation;
      return _field.save();
    };

    // required =====
    _field.isRequired = true;
    await _field.save();
    expectError('required', '');

    // email =====
    await changeValidation('email');
    expectError('Invalid email', 'wrongValue');

    // number =====
    await changeValidation('number');
    expectError('Invalid number', 'wrongValue');

    // date =====
    await changeValidation('date');
    expectError('Invalid date', 'wrongValue');
  });

  test('Validate submission: valid values', async () => {
    const expectValid = async value => {
      const res = await Fields.validate({ _id: _field._id, value });
      expect(res).toBe('valid');
    };

    const changeValidation = validation => {
      _field.validation = validation;
      return _field.save();
    };

    // required =====
    _field.isRequired = true;
    await changeValidation(null);
    expectValid('value');

    // email =====
    await changeValidation('email');
    expectValid('email@gmail.com');

    // number =====
    await changeValidation('number');
    expectValid('2.333');
    expectValid('2');

    // date =====
    await changeValidation('date');
    expectValid('2017-01-01');
  });
});
