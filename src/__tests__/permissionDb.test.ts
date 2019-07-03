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
    allowed: true,
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
        { name: 'action3', description: 'd', use: [] },
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

  test('Create permission invalid action', async () => {
    expect.assertions(1);
    try {
      await Permissions.createPermission({ userIds: [_user._id], ...doc });
    } catch (e) {
      expect(e.message).toEqual('Invalid data');
    }
  });

  test('Create permission', async () => {
    const permission = await Permissions.createPermission({
      ...doc,
      userIds: [_user._id],
      groupIds: [_group._id],
      actions: ['action', 'action1', 'action2', 'action3'],
    });

    expect(permission.length).toEqual(8);
    const per = permission.find(p => p.groupId === _group._id && p.action === 'action');
    expect(per.module).toEqual(doc.module);
  });

  test('Remove permission not found', async () => {
    expect.assertions(1);
    try {
      await Permissions.removePermission([_user._id]);
    } catch (e) {
      expect(e.message).toEqual(`Permission not found`);
    }
  });

  test('Remove permission', async () => {
    const isDeleted = await Permissions.removePermission([_permission.id]);

    expect(isDeleted).toBeTruthy();
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
});
