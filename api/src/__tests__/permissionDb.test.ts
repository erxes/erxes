import { registerModule } from '../data/permissions/utils';
import { permissionFactory, userFactory, usersGroupFactory } from '../db/factories';
import { Permissions, Users, UsersGroups } from '../db/models';

import './setup.ts';

describe('Test permissions model', () => {
  let _permission;
  let _user;
  let _group;

  const docGroup = {
    name: 'New Group',
    description: 'User group',
  };

  const doc = {
    actions: ['up', ' test'],
    module: 'module name',
  };

  registerModule({
    module: {
      name: 'new module',
      description: 'd',
      actions: [
        { name: 'action', description: 'd', use: [] },
        { name: 'action1', description: 'd', use: [] },
        { name: 'action2', description: 'd', use: [] },
        { name: 'action3', description: 'd' },
      ],
    },
  });

  beforeEach(async () => {
    // Creating test data
    _permission = await permissionFactory();
    _user = await userFactory();
    _group = await usersGroupFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await Permissions.deleteMany({});
    await UsersGroups.deleteMany({});
  });

  test('Create permission (Error: Invalid data)', async () => {
    expect.assertions(1);
    try {
      await Permissions.createPermission({ userIds: [_user._id], ...doc, allowed: true });
    } catch (e) {
      expect(e.message).toEqual('Invalid data');
    }
  });

  test('Create permission without user and group', async () => {
    const permission = await Permissions.createPermission({
      ...doc,
      actions: ['action', 'action1', 'action2', 'action3'],
      allowed: true,
    });

    expect(permission.length).toEqual(0);
  });

  test('Create permission', async () => {
    const permission = await Permissions.createPermission({
      ...doc,
      allowed: true,
      userIds: [_user._id],
      groupIds: [_group._id],
      actions: ['action', 'action', 'action1', 'action2', 'action3'],
    });

    expect(permission.length).toEqual(8);
    const per = permission.find(p => p.groupId === _group._id && p.action === 'action');

    if (per) {
      expect(per.module).toEqual(doc.module);
    }
  });

  test('Remove permission not found', async () => {
    expect.assertions(1);
    try {
      await Permissions.removePermission([_user._id]);
    } catch (e) {
      expect(e.message).toEqual(`Permission not found`);
    }
  });

  test('Test getPermission() with fake id', async () => {
    expect.assertions(1);

    try {
      await Permissions.getPermission('not-found');
    } catch (e) {
      expect(e.message).toBe('Permission not found');
    }
  });

  test('Test getPermission() with real id', async () => {
    const perm = await Permissions.getPermission(_permission._id);

    expect(perm._id).toBe(_permission._id);
  });

  test('Remove permission', async () => {
    const isDeleted = await Permissions.removePermission([_permission.id]);

    expect(isDeleted).toBeTruthy();
  });

  test('Get user group', async () => {
    try {
      await UsersGroups.getGroup('fakeId');
    } catch (e) {
      expect(e.message).toBe('User group not found');
    }

    const userGroup = await usersGroupFactory();

    const response = await UsersGroups.getGroup(userGroup._id);

    expect(response).toBeDefined();
  });

  test('Create user group', async () => {
    const user1 = await userFactory({});
    const user2 = await userFactory({});

    const groupObj = await UsersGroups.createGroup(docGroup, [user1._id, user2._id]);
    const updatedUser1 = await Users.findOne({ _id: user1._id });
    const updatedUser2 = await Users.findOne({ _id: user2._id });

    expect(groupObj).toBeDefined();
    expect(groupObj.name).toEqual(docGroup.name);
    expect(groupObj.description).toEqual(docGroup.description);

    expect((updatedUser1 && updatedUser1.groupIds) || []).toContain(groupObj._id);
    expect((updatedUser2 && updatedUser2.groupIds) || []).toContain(groupObj._id);
  });

  test('Update group', async () => {
    expect.assertions(7);

    const otherGroup = await usersGroupFactory();
    const user1 = await userFactory({ groupIds: [otherGroup._id, _group._id] });
    const user2 = await userFactory({ groupIds: [otherGroup._id, _group._id] });

    const user3 = await userFactory({ groupIds: [otherGroup._id] });
    const user4 = await userFactory({ groupIds: [otherGroup._id] });

    const groupObj = await UsersGroups.updateGroup(_group._id, docGroup, [user3._id, user4._id]);

    const updatedUser1 = await Users.findOne({ _id: user1._id });
    const updatedUser2 = await Users.findOne({ _id: user2._id });
    const updatedUser3 = await Users.findOne({ _id: user3._id });
    const updatedUser4 = await Users.findOne({ _id: user4._id });

    expect(groupObj).toBeDefined();
    expect(groupObj.name).toEqual(docGroup.name);
    expect(groupObj.description).toEqual(docGroup.description);

    if (updatedUser1 && updatedUser2 && updatedUser3 && updatedUser4) {
      expect(JSON.stringify(updatedUser1.groupIds)).toContain(JSON.stringify([otherGroup._id]));
      expect(JSON.stringify(updatedUser2.groupIds)).toEqual(JSON.stringify([otherGroup._id]));
      expect(JSON.stringify(updatedUser3.groupIds)).toEqual(JSON.stringify([otherGroup._id, _group._id]));
      expect(JSON.stringify(updatedUser4.groupIds)).toEqual(JSON.stringify([otherGroup._id, _group._id]));
    }
  });

  test('Remove group', async () => {
    const isDeleted = await UsersGroups.removeGroup(_group.id);
    expect(isDeleted).toBeTruthy();
  });

  test('Remove group not found', async () => {
    try {
      await UsersGroups.removeGroup('groupId');
    } catch (e) {
      expect(e.message).toBe('Group not found with id groupId');
    }
  });

  test('Test copyGroup()', async () => {
    const user1 = await userFactory({});
    const user2 = await userFactory({});
    const group = await UsersGroups.createGroup(
      {
        name: 'groupName',
        description: 'groupDescription',
      },
      [user1._id, user2._id],
    );

    await permissionFactory({ groupId: group._id });
    await permissionFactory({ groupId: group._id });

    const clone = await UsersGroups.copyGroup(group._id, [user1._id, user2._id]);
    const clonedPermissions = await Permissions.find({ groupId: clone._id });
    const nameCount = await UsersGroups.countDocuments({ name: new RegExp(`${group.name}`, 'i') });

    expect(clone.name).toBe(`${group.name}-copied-${nameCount - 1}`);
    expect(clone.description).toBe(`${group.description}-copied`);
    expect(clonedPermissions.length).toBe(2);
  });
});
