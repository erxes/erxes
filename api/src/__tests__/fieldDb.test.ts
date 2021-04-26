import {
  customerFactory,
  fieldFactory,
  fieldGroupFactory,
  formFactory,
  userFactory
} from '../db/factories';
import { Customers, Fields, FieldsGroups, Forms } from '../db/models';
import { FIELDS_GROUPS_CONTENT_TYPES } from '../db/models/definitions/constants';

import './setup.ts';

/**
 * Field related tests
 */
describe('Fields', () => {
  let _field;

  beforeEach(async () => {
    // creating field with contentType other than customer
    _field = await fieldFactory({ contentType: 'form', order: 1 });
  });

  afterEach(async () => {
    // Clearing test data
    await Forms.deleteMany({});
    await Fields.deleteMany({});
    await FieldsGroups.deleteMany({});
  });

  test('createField() without contentTypeId', async () => {
    const group = await fieldGroupFactory({ contentType: 'customer' });

    if (!group) {
      throw new Error('Couldnt create group');
    }

    // first attempt
    let field = await Fields.createField({
      contentType: 'customer',
      text: 'text'
    });
    expect(field.order).toBe(0);

    // second attempt
    field = await Fields.createField({ contentType: 'customer', text: 'text' });
    expect(field.order).toBe(1);

    // third attempt
    field = await Fields.createField({ contentType: 'customer', text: 'text' });
    expect(field.order).toBe(2);

    field = await Fields.createField({
      contentType: 'customer',
      text: 'text',
      groupId: group._id
    });
    expect(field.order).toBe(0);
  });

  test('createField() with contentTypeId', async () => {
    const contentType = 'form';
    const form1 = await formFactory({});
    const form2 = await formFactory({});

    // first attempt
    let field = await Fields.createField({
      contentType,
      text: 'text',
      contentTypeId: form1._id,
      groupName: 'testGroup'
    });
    expect(field.order).toBe(0);

    // second attempt
    field = await Fields.createField({
      contentType,
      contentTypeId: form1._id,
      text: 'text'
    });
    expect(field.order).toBe(1);

    // must create new order
    field = await Fields.createField({
      contentType,
      contentTypeId: form2._id,
      text: 'text'
    });
    expect(field.order).toBe(0);
  });

  test('createField() required contentTypeId when form', async () => {
    expect.assertions(1);

    try {
      await Fields.createField({ contentType: 'form', text: 'text' });
    } catch (e) {
      expect(e.message).toEqual('Content type id is required');
    }
  });

  test('createField() check contentTypeId existence', async () => {
    expect.assertions(1);

    try {
      await Fields.createField({
        contentType: 'form',
        contentTypeId: 'DFAFDFADS',
        text: 'text'
      });
    } catch (e) {
      expect(e.message).toEqual('Form not found with _id of DFAFDFADS');
    }
  });

  test('updateOrder()', async () => {
    const field1 = await fieldFactory({});
    const field2 = await fieldFactory({});

    if (!field1 || !field2) {
      throw new Error('Couldnt create field');
    }

    const [updatedField1, updatedField2] = await Fields.updateOrder([
      { _id: field1._id, order: 10 },
      { _id: field2._id, order: 11 }
    ]);

    expect(updatedField1.order).toBe(10);
    expect(updatedField2.order).toBe(11);
  });

  test('Update field valid', async () => {
    const doc = await fieldFactory({ contentType: 'form' });
    const doc2 = await fieldFactory({ contentType: 'form' });
    const group = await fieldGroupFactory({ contentType: 'form' });
    const testField = await fieldFactory({ isDefinedByErxes: true });

    if (!doc || !testField) {
      throw new Error('Couldnt create field');
    }

    const fieldDoc = {
      ...doc.toJSON(),
      groupName: group && group.name
    };

    delete fieldDoc._id;

    const fieldObj = await Fields.updateField(_field._id, fieldDoc);
    const fieldObj2 = await Fields.updateField(doc2._id, {
      ...doc2.toJSON(),
      groupName: 'test group'
    });

    try {
      await Fields.updateField(testField._id, { text: 'text' });
    } catch (e) {
      expect(e.message).toBe('Cant update this field');
    }

    if (!fieldObj.options || !doc.options) {
      throw new Error('Options not found in field');
    }

    // check updates
    expect(fieldObj.contentType).toBe(doc.contentType);
    expect(fieldObj.contentTypeId).toBe(doc.contentTypeId);
    expect(fieldObj.type).toBe(doc.type);
    expect(fieldObj.validation).toBe(doc.validation);
    expect(fieldObj.text).toBe(doc.text);
    expect(fieldObj.description).toBe(doc.description);
    expect(fieldObj.options[0]).toEqual(doc.options[0]);
    expect(fieldObj.isRequired).toBe(doc.isRequired);
    expect(fieldObj.order).toBe(doc.order);
    expect(fieldObj.groupId).toBe(group && group._id);
    expect(fieldObj2.groupId).toBeDefined();
  });

  test('Remove field valid', async () => {
    expect.assertions(4);

    await customerFactory({ customFieldsData: { [_field._id]: '1231' } });
    const testField = await fieldFactory({ isDefinedByErxes: true });

    try {
      await Fields.removeField('DFFFDSFD');
    } catch (e) {
      expect(e.message).toBe('Field not found with id DFFFDSFD');
    }

    try {
      await Fields.updateField(testField._id, { text: 'text' });
    } catch (e) {
      expect(e.message).toBe('Cant update this field');
    }

    await Fields.removeField(_field.id);

    const index = `customFieldsData.${_field._id}`;

    // Checking if field  value removed from customer
    expect(await Customers.find({ [index]: { $exists: true } })).toHaveLength(
      0
    );

    const fieldObj = await Fields.findOne({ _id: _field.id });
    expect(fieldObj).toBeNull();
  });

  test('Validate submission: field not found', async () => {
    expect.assertions(1);

    const _id = 'INVALID_ID';

    try {
      await Fields.clean(_id, '');
    } catch (e) {
      expect(e.message).toBe(`Field not found with the _id of ${_id}`);
    }
  });

  test('Validate submission: invalid values', async () => {
    expect.assertions(4);

    const expectError = async (message, value) => {
      try {
        await Fields.clean(_field._id, value);
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
    await expectError('required', '');

    // email =====
    await changeValidation('email');
    await expectError('Invalid email', 'wrongValue');

    // number =====
    await changeValidation('number');
    await expectError('Invalid number', 'wrongValue');

    // date =====
    await changeValidation('date');
    await expectError('Invalid date', 'wrongValue');
  });

  test('Validate submission: valid values', async () => {
    const expectValid = async value => {
      const response = await Fields.clean(_field._id, value);
      expect(response).toBe(value);
    };

    const changeValidation = validation => {
      _field.validation = validation;
      return _field.save();
    };

    // required =====
    _field.isRequired = true;
    await changeValidation(null);
    await expectValid('value');

    // email =====
    await changeValidation('email');
    await expectValid('email@gmail.com');

    // number =====
    await changeValidation('number');
    await expectValid('2.333');
    await expectValid('2');

    // date =====
    // date values must be convert to date object
    await changeValidation('date');
    const res = await Fields.clean(_field._id, '2017-01-01');
    expect(res).toEqual(expect.any(Date));
  });

  test('Validate fields', async () => {
    expect.assertions(4);

    // required =====
    _field.isRequired = true;
    await _field.save();

    try {
      await Fields.cleanMulti({ [_field._id]: '' });
    } catch (e) {
      expect(e.message).toBe(`${_field.text}: required`);
    }

    // if empty object pass
    let response = await Fields.cleanMulti({});

    expect(response).toEqual({});

    // if field is empty
    _field.isRequired = false;
    await _field.save();

    response = await Fields.cleanMulti({ [_field._id]: '' });

    expect(response[_field._id]).toBe('');

    // if value is not empty
    response = await Fields.cleanMulti({ [_field._id]: 10 });

    expect(response[_field._id]).toBe(10);
  });

  test('Update field visible', async () => {
    expect.assertions(2);

    const field = await fieldFactory({ isVisible: true });
    const user = await userFactory({});
    const testField = await fieldFactory({ canHide: false });

    const isVisible = false;

    if (!field || !testField) {
      throw new Error('Couldnt create field');
    }

    try {
      await Fields.updateFieldsVisible(testField._id, '123321', false);
    } catch (e) {
      expect(e.message).toBe('Cant update this field');
    }

    const fieldObj = await Fields.updateFieldsVisible(
      field._id,
      user._id,
      isVisible
    );

    expect(fieldObj.isVisible).toBe(isVisible);
  });

  test('Update field visible: checkCanToggleVisible', async () => {
    const field = await fieldFactory({ isVisible: true, canHide: false });

    try {
      await Fields.updateFieldsVisible(field._id, '123321', false);
    } catch (e) {
      expect(e.message).toBe('Cant update this field');
    }
  });
});

/**
 * Fields groups related tests
 */
describe('Fields groups', () => {
  let _fieldGroup;

  beforeEach(async () => {
    // creating field group
    _fieldGroup = await fieldGroupFactory({
      contentType: FIELDS_GROUPS_CONTENT_TYPES.CUSTOMER,
      isDefinedByErxes: true
    });
  });

  afterEach(async () => {
    // Clearing test data
    await FieldsGroups.deleteMany({});
  });

  test('Create group', async () => {
    expect.assertions(6);
    const user = await userFactory({});

    const doc = {
      name: 'Name',
      description: 'Description',
      contentType: FIELDS_GROUPS_CONTENT_TYPES.CUSTOMER,
      lastUpdatedUserId: user._id
    };

    let groupObj = await FieldsGroups.createGroup(doc);
    expect(groupObj.name).toBe(doc.name);
    expect(groupObj.description).toBe(doc.description);
    expect(groupObj.contentType).toBe(doc.contentType);
    // we already created fieldGroup on beforeEach of every test
    expect(groupObj.order).toBe(1);

    groupObj = await FieldsGroups.createGroup(doc);

    expect(groupObj.order).toBe(2);

    // create first group whose contentType is company
    doc.contentType = FIELDS_GROUPS_CONTENT_TYPES.COMPANY;
    groupObj = await FieldsGroups.createGroup(doc);

    expect(groupObj.contentType).toBe(FIELDS_GROUPS_CONTENT_TYPES.COMPANY);
  });

  test('Update group', async () => {
    expect.assertions(3);
    const user = await userFactory({});

    const fieldGroup = await fieldGroupFactory({});

    const doc = {
      name: 'test name',
      description: 'test description',
      lastUpdatedUserId: user._id
    };

    try {
      await FieldsGroups.updateGroup(_fieldGroup._id, doc);
    } catch (e) {
      expect(e.message).toBe('Cant update this group');
    }

    if (!fieldGroup) {
      throw new Error('Couldnt create fieldGroup');
    }

    const groupObj = await FieldsGroups.updateGroup(fieldGroup._id, doc);

    expect(groupObj.name).toBe(doc.name);
    expect(groupObj.description).toBe(doc.description);
  });

  test('Remove group', async () => {
    expect.assertions(3);

    const fieldGroup = await fieldGroupFactory({});

    if (!fieldGroup) {
      throw new Error('Couldnt create fieldGroup');
    }

    await fieldFactory({ groupId: fieldGroup._id });

    try {
      await FieldsGroups.removeGroup(_fieldGroup._id);
    } catch (e) {
      expect(e.message).toBe('Cant update this group');
    }

    await FieldsGroups.removeGroup(fieldGroup._id);

    expect(await Fields.find({ groupId: fieldGroup._id })).toHaveLength(0);
    expect(await FieldsGroups.findOne({ _id: fieldGroup._id })).toBeNull();
  });

  test('Remove group with fake group, with exception', async () => {
    expect.assertions(1);

    const _id = '1333131';

    try {
      await FieldsGroups.removeGroup(_id);
    } catch (e) {
      expect(e.message).toBe(`Group not found with id of ${_id}`);
    }
  });

  test('Update group visible', async () => {
    expect.assertions(2);

    const fieldGroup = await fieldGroupFactory({ isVisible: true });
    const user = await userFactory({});

    if (!fieldGroup) {
      throw new Error('Couldnt create fieldGroup');
    }

    try {
      await FieldsGroups.updateGroupVisible(_fieldGroup._id, user._id, true);
    } catch (e) {
      expect(e.message).toBe('Cant update this group');
    }

    const isVisible = false;
    const groupObj = await FieldsGroups.updateGroupVisible(
      fieldGroup._id,
      user._id,
      isVisible
    );

    expect(groupObj.isVisible).toBe(isVisible);
  });

  test('create system groups and fields', async () => {
    await FieldsGroups.createSystemGroupsFields();
  });

  test('updateOrder()', async () => {
    const group1 = await fieldGroupFactory({});
    const group2 = await fieldGroupFactory({});

    if (!group1 || !group2) {
      fail('Could not create group');
    }

    const [updatedGroup1, updatedGroup2] = await FieldsGroups.updateOrder([
      { _id: group1._id, order: 3 },
      { _id: group2._id, order: 4 }
    ]);

    expect(updatedGroup1.order).toBe(3);
    expect(updatedGroup2.order).toBe(4);
  });
});
