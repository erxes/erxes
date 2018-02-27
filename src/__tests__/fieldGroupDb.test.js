/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Fields, FieldsGroups } from '../db/models';
import { FIELDS_GROUPS_CONTENT_TYPES } from '../data/constants';
import { fieldGroupFactory, userFactory, fieldFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

/**
 * Fields groups related tests
 */
describe('Fields', () => {
  let _fieldGroup;

  beforeEach(async () => {
    // creating field group
    _fieldGroup = await fieldGroupFactory({
      contentType: FIELDS_GROUPS_CONTENT_TYPES.CUSTOMER,
      order: 1,
      isDefinedByErxes: true,
    });
  });

  afterEach(async () => {
    // Clearing test data
    await Fields.remove({});
  });

  test('Create group', async () => {
    expect.assertions(4);

    const user = await userFactory({});

    const doc = {
      name: 'Name',
      description: 'Description',
      contentType: FIELDS_GROUPS_CONTENT_TYPES.CUSTOMER,
      lastUpdatedUserId: user._id,
    };

    const groupObj = await FieldsGroups.createGroup(doc);

    expect(groupObj.name).toBe(doc.name);
    expect(groupObj.description).toBe(doc.description);
    expect(groupObj.contentType).toBe(doc.contentType);
    expect(groupObj.lastUpdatedUserId).toBe(doc.lastUpdatedUserId);
  });

  test('Update group', async () => {
    expect.assertions(4);

    const user = await userFactory({});
    const fieldGroup = await fieldGroupFactory({});

    const doc = {
      name: 'test name',
      description: 'test description',
      lastUpdatedUserId: user._id,
    };

    try {
      await FieldsGroups.updateGroup(_fieldGroup._id, doc);
    } catch (e) {
      expect(e.message).toBe('Cant update this group');
    }

    const groupObj = await FieldsGroups.updateGroup(fieldGroup._id, doc);

    expect(groupObj.name).toBe(doc.name);
    expect(groupObj.description).toBe(doc.description);
    expect(groupObj.lastUpdatedUserId).toBe(doc.lastUpdatedUserId);
  });

  test('Remove group', async () => {
    expect.assertions(3);

    const fieldGroup = await fieldGroupFactory({});
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
    expect.assertions(3);

    const fieldGroup = await fieldGroupFactory({ isVisible: true });
    const user = await userFactory({});

    try {
      await FieldsGroups.updateGroupVisible(_fieldGroup._id, true, user._id);
    } catch (e) {
      expect(e.message).toBe('Cant update this group');
    }

    const isVisible = false;
    const groupObj = await FieldsGroups.updateGroupVisible(fieldGroup._id, isVisible, user._id);

    expect(groupObj.isVisible).toBe(isVisible);
    expect(groupObj.lastUpdatedUserId).toBe(user._id);
  });
});
