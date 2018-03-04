/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import faker from 'faker';
import { FIELDS_GROUPS_CONTENT_TYPES } from '../data/constants';
import { connect, disconnect } from '../db/connection';
import { Fields, Users, FieldsGroups } from '../db/models';
import { userFactory, fieldFactory, fieldGroupFactory } from '../db/factories';
import { fieldMutations, fieldsGroupsMutations } from '../data/resolvers/mutations/fields';

beforeAll(() => connect());

afterAll(() => disconnect());

/*
 * Generate test data
 */
const doc = {
  type: 'input',
  validation: 'number',
  text: faker.random.word(),
  description: faker.random.word(),
  isRequired: false,
  order: 0,
};

describe('Fields mutations', () => {
  let _user;
  let _field;

  beforeEach(async () => {
    // Creating test data
    _user = await userFactory();
    _field = await fieldFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await Fields.remove({});
    await FieldsGroups.remove({});
    await Users.remove({});
  });

  test('Check login required', async () => {
    expect.assertions(4);

    const check = async fn => {
      try {
        await fn({}, {}, {});
      } catch (e) {
        expect(e.message).toEqual('Login required');
      }
    };

    // add
    check(fieldMutations.fieldsAdd);

    // edit
    check(fieldMutations.fieldsEdit);

    // add company
    check(fieldMutations.fieldsRemove);

    // update order
    check(fieldMutations.fieldsUpdateOrder);
  });

  test('Create field', async () => {
    Fields.createField = jest.fn();

    await fieldMutations.fieldsAdd({}, doc, { user: _user });

    expect(Fields.createField).toBeCalledWith({ ...doc, lastUpdatedUserId: _user._id });
  });

  test('Update field valid', async () => {
    const mockedMethod = jest.spyOn(Fields, 'updateField');

    await fieldMutations.fieldsEdit({}, { _id: _field._id, ...doc }, { user: _user });

    expect(Fields.updateField).toBeCalledWith(_field._id, { ...doc, lastUpdatedUserId: _user._id });

    mockedMethod.mockRestore();
  });

  test('Remove field valid', async () => {
    Fields.removeField = jest.fn();

    await fieldMutations.fieldsRemove({}, { _id: _field._id }, { user: _user });

    expect(Fields.removeField).toBeCalledWith(_field._id);
  });

  test('Update order', async () => {
    Fields.updateOrder = jest.fn();

    const orders = [{ _id: 'DFADF', order: 1 }];

    await fieldMutations.fieldsUpdateOrder({}, { _id: _field._id, orders }, { user: _user });

    expect(Fields.updateOrder).toBeCalledWith(orders);
  });

  test('Update visible', async () => {
    Fields.updateFieldsVisible = jest.fn();

    const isVisible = false;

    await fieldMutations.fieldsUpdateVisible({}, { _id: _field._id, isVisible }, { user: _user });

    expect(Fields.updateFieldsVisible).toBeCalledWith(_field._id, isVisible, _user._id);
  });
});

describe('Fields Group mutations', () => {
  let _user;
  let _fieldGroup;

  beforeEach(async () => {
    // Creatubg test data
    _user = await userFactory({});
    _fieldGroup = await fieldGroupFactory({});
  });

  afterEach(async () => {
    // Clearing test data
    await FieldsGroups.remove({});
    await Fields.remove({});
    await Users.remove({});
  });

  test('Check login required', async () => {
    expect.assertions(4);

    const check = async fn => {
      try {
        await fn({}, {}, {}, {});
      } catch (e) {
        expect(e.message).toEqual('Login required');
      }
    };

    // add
    check(fieldsGroupsMutations.fieldsGroupsAdd);

    // edit
    check(fieldsGroupsMutations.fieldsGroupsEdit);

    // remove
    check(fieldsGroupsMutations.fieldsGroupsRemove);

    // update visible
    check(fieldsGroupsMutations.fieldsGroupsUpdateVisible);
  });

  test('Create field', async () => {
    const mockedMethod = jest.spyOn(FieldsGroups, 'createGroup');

    const doc = {
      name: faker.random.word(),
      description: faker.random.word(),
      contentType: FIELDS_GROUPS_CONTENT_TYPES.CUSTOMER,
    };

    await fieldsGroupsMutations.fieldsGroupsAdd({}, doc, { user: _user });

    expect(FieldsGroups.createGroup).toBeCalledWith({ ...doc, lastUpdatedUserId: _user._id });

    mockedMethod.mockRestore();
  });

  test('Update field group', async () => {
    const mockedMethod = jest.spyOn(FieldsGroups, 'updateGroup');

    const doc = {
      name: faker.random.word(),
      description: faker.random.word(),
    };

    await fieldsGroupsMutations.fieldsGroupsEdit(
      {},
      { _id: _fieldGroup._id, ...doc },
      { user: _user },
    );

    expect(FieldsGroups.updateGroup).toBeCalledWith(_fieldGroup._id, {
      ...doc,
      lastUpdatedUserId: _user._id,
    });

    mockedMethod.mockRestore();
  });

  test('Remove field group', async () => {
    FieldsGroups.removeGroup = jest.fn();

    await fieldsGroupsMutations.fieldsGroupsRemove({}, { _id: _fieldGroup._id }, { user: _user });

    expect(FieldsGroups.removeGroup).toBeCalledWith(_fieldGroup._id);
  });

  test('Update visible', async () => {
    FieldsGroups.updateGroupVisible = jest.fn();

    const isVisible = false;

    await fieldsGroupsMutations.fieldsGroupsUpdateVisible(
      {},
      { _id: _fieldGroup._id, isVisible },
      { user: _user },
    );

    expect(FieldsGroups.updateGroupVisible).toBeCalledWith(_fieldGroup._id, isVisible, _user._id);
  });
});
