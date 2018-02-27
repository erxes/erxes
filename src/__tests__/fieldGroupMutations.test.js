/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import faker from 'faker';
import { connect, disconnect } from '../db/connection';
import { FieldsGroups, Users } from '../db/models';
import { FIELDS_GROUPS_CONTENT_TYPES } from '../data/constants';
import { userFactory, fieldGroupFactory } from '../db/factories';
import fieldsGroupsMutations from '../data/resolvers/mutations/fieldsgroups';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Fields mutations', () => {
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
      lastUpdatedUserId: _user._id,
    };

    await fieldsGroupsMutations.fieldsGroupsAdd({}, doc, { user: _user });

    expect(FieldsGroups.createGroup).toBeCalledWith(doc);

    mockedMethod.mockRestore();
  });

  test('Update field group', async () => {
    FieldsGroups.updateGroup = jest.fn();

    const doc = {
      name: faker.random.word(),
      description: faker.random.word(),
      lastUpdatedUserId: _user._id,
    };

    await fieldsGroupsMutations.fieldsGroupsEdit(
      {},
      { _id: _fieldGroup._id, ...doc },
      { user: _user },
    );

    expect(FieldsGroups.updateGroup).toBeCalledWith(_fieldGroup._id, doc);
  });

  test('Remove field group', async () => {
    FieldsGroups.removeGroup = jest.fn();

    await fieldsGroupsMutations.fieldsGroupsRemove({}, { _id: _fieldGroup._id }, { user: _user });

    expect(FieldsGroups.removeGroup).toBeCalledWith(_fieldGroup._id);
  });

  test('Update visible', async () => {
    FieldsGroups.updateGroupVisible = jest.fn();

    const isVisible = false;
    const lastUpdatedUserId = _user._id;

    await fieldsGroupsMutations.fieldsGroupsUpdateVisible(
      {},
      { _id: _fieldGroup._id, isVisible, lastUpdatedUserId },
      { user: _user },
    );

    expect(FieldsGroups.updateGroupVisible).toBeCalledWith(
      _fieldGroup._id,
      isVisible,
      lastUpdatedUserId,
    );
  });
});
