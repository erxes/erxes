import { registerModule } from '../data/permissions/utils';
import { permissionFactory, userFactory, usersGroupFactory } from '../db/factories';
import { Permissions, UsersGroups } from '../db/models';

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
    _group = await usersGroupFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await Permissions.remove({});
    await UsersGroups.remove({});
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
    const groupObj = await UsersGroups.createGroup(docGroup);

    expect(groupObj).toBeDefined();
    expect(groupObj.name).toEqual(docGroup.name);
    expect(groupObj.description).toEqual(docGroup.description);
  });

  test('Update group', async () => {
    const groupObj = await UsersGroups.updateGroup(_group._id, docGroup);

    expect(groupObj).toBeDefined();
    expect(groupObj.name).toEqual(docGroup.name);
    expect(groupObj.description).toEqual(docGroup.description);
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
