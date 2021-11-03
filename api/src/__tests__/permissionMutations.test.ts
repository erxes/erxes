import './setup.ts';

import { permissionMutations } from '../data/resolvers/mutations/permissions';
import { graphqlRequest } from '../db/connection';
import {
  permissionFactory,
  userFactory,
  usersGroupFactory
} from '../db/factories';
import { Permissions, Users, UsersGroups } from '../db/models';

describe('Test permissions mutations', () => {
  let userPermission;
  let groupPermission;
  let _user;
  let _group;
  let context;

  const doc = {
    actions: ['up', ' test'],
    allowed: true,
    module: 'module name'
  };

  const permissionFields = `
    _id
    module
    action
    userId
    groupId
    requiredActions
    allowed
  `;

  beforeEach(async () => {
    // Creating test data
    _user = await userFactory({ isOwner: true });
    _group = await usersGroupFactory();

    userPermission = await permissionFactory({ userId: _user._id });
    groupPermission = await permissionFactory({ groupId: _group._id });

    context = { user: _user };
  });

  afterEach(async () => {
    // Clearing test data
    await Permissions.deleteMany({});
    await UsersGroups.deleteMany({});
    await Users.deleteMany({});
  });

  test('Permission login required functions', async () => {
    const checkLogin = async (fn, args) => {
      try {
        await fn({}, args, {});
      } catch (e) {
        expect(e.message).toEqual('Login required');
      }
    };

    expect.assertions(2);

    // add permission
    checkLogin(permissionMutations.permissionsAdd, doc);

    // remove permission
    checkLogin(permissionMutations.permissionsRemove, { ids: [] });
  });

  test(`test if Error('Permission required') error is working as intended`, async () => {
    const checkLogin = async (fn, args) => {
      try {
        await fn({}, args, { user: { _id: 'fakeId' } });
      } catch (e) {
        expect(e.message).toEqual('Permission required');
      }
    };

    expect.assertions(2);

    // add permission
    await checkLogin(permissionMutations.permissionsAdd, doc);

    // remove permission
    await checkLogin(permissionMutations.permissionsRemove, {
      ids: [userPermission._id]
    });
  });

  test('Create permission', async () => {
    const args = {
      module: 'module name',
      actions: ['manageBrands'],
      userIds: [_user._id],
      groupIds: [_group._id],
      allowed: true
    };

    const mutation = `
      mutation permissionsAdd(
        $module: String!,
        $actions: [String!]!,
        $userIds: [String!],
        $groupIds: [String!],
        $allowed: Boolean
      ) {
        permissionsAdd(
          module: $module
          actions: $actions
          userIds: $userIds
          groupIds: $groupIds
          allowed: $allowed
        ) {
          ${permissionFields}
        }
      }
    `;

    const [permission] = await graphqlRequest(
      mutation,
      'permissionsAdd',
      args,
      context
    );

    expect(permission.module).toEqual('module name');
  });

  test('Remove permission', async () => {
    const ids = [userPermission._id, groupPermission._id];

    const mutation = `
      mutation permissionsRemove($ids: [String]!) {
        permissionsRemove(ids: $ids)
      }
    `;

    await graphqlRequest(mutation, 'permissionsRemove', { ids }, context);

    expect(await Permissions.find({ _id: userPermission._id })).toEqual([]);
    expect(await Permissions.find({ _id: groupPermission._id })).toEqual([]);
  });

  test('Create group', async () => {
    const user1 = await userFactory({});
    const user2 = await userFactory({});

    const args = {
      memberIds: [user1._id, user2._id],
      name: 'created name',
      description: 'created description'
    };

    const mutation = `
      mutation usersGroupsAdd($name: String! $description: String!, $memberIds: [String]) {
        usersGroupsAdd(name: $name description: $description, memberIds: $memberIds) {
          _id
          name
          description
          memberIds
        }
      }
    `;

    const createdGroup = await graphqlRequest(
      mutation,
      'usersGroupsAdd',
      args,
      context
    );

    expect(createdGroup.name).toEqual('created name');
    expect(createdGroup.description).toEqual('created description');
    expect(createdGroup.memberIds).toContain(user1._id);
    expect(createdGroup.memberIds).toContain(user2._id);
  });

  test('Update group', async () => {
    await userFactory({ groupIds: [_group._id] });
    await userFactory({ groupIds: [_group._id] });

    const user1 = await userFactory({});
    const user2 = await userFactory({});

    const args = {
      name: 'updated name',
      memberIds: [user1._id, user2._id],
      description: 'updated description'
    };

    const mutation = `
      mutation usersGroupsEdit($_id: String! $name: String! $description: String!, $memberIds: [String]) {
        usersGroupsEdit(_id: $_id name: $name description: $description, memberIds: $memberIds) {
          _id
          name
          description
          memberIds
        }
      }
    `;

    const updatedGroup = await graphqlRequest(
      mutation,
      'usersGroupsEdit',
      { _id: _group._id, ...args },
      { user: _user }
    );

    expect(updatedGroup.name).toBe('updated name');
    expect(updatedGroup.description).toBe('updated description');
    expect(updatedGroup.memberIds).toContain(user1._id);
    expect(updatedGroup.memberIds).toContain(user2._id);
  });

  test('Remove group', async () => {
    const mutation = `
      mutation usersGroupsRemove($_id: String!) {
        usersGroupsRemove(_id: $_id)
      }
    `;

    await userFactory({ groupIds: [_group._id] });
    await userFactory({ groupIds: [_group._id] });

    await graphqlRequest(
      mutation,
      'usersGroupsRemove',
      { _id: _group._id },
      context
    );

    expect(await UsersGroups.findOne({ _id: _group._id })).toBe(null);
  });

  test('Test usersGroupsCopy()', async () => {
    const mutation = `
      mutation usersGroupsCopy($_id: String!) {
        usersGroupsCopy(_id: $_id) {
          _id
        }
      }
    `;

    const clone = await graphqlRequest(
      mutation,
      'usersGroupsCopy',
      { _id: _group._id },
      context
    );

    expect(clone._id).toBeDefined();
  });

  test('Test fixMissingPermissions()', async () => {
    await permissionFactory({
      module: 'brands',
      action: 'brandsAll',
      userId: _user._id,
      requiredActions: ['showBrands', 'manageBrands']
    });

    const mutation = `
      mutation permissionsFix {
        permissionsFix
      }
    `;

    const response = await graphqlRequest(
      mutation,
      'permissionsFix',
      null,
      context
    );

    expect(response.length).toBe(1);
  });
});
