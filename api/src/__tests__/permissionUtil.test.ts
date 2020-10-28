import { can, registerModule } from '../data/permissions/utils';
import {
  permissionFactory,
  userFactory,
  usersGroupFactory
} from '../db/factories';
import { Permissions, Users, UsersGroups } from '../db/models';

import { IUserDocument } from '../db/models/definitions/users';
import './setup.ts';

describe('Test permission utils', () => {
  let _user: IUserDocument;
  let _user2: IUserDocument;
  let _user3: IUserDocument;

  const moduleObj = {
    name: 'testModule',
    description: 'Test module',
    actions: [
      {
        name: 'testModuleAction',
        description: 'Test module action',
        use: ['action 1', 'action 2']
      }
    ]
  };

  beforeEach(async () => {
    const _group = await usersGroupFactory();
    const _group1 = await usersGroupFactory();

    // Creating test data
    _user = await userFactory({ isOwner: true });
    _user2 = await userFactory({});
    _user3 = await userFactory({
      groupIds: [_group1._id, _group._id]
    });

    await permissionFactory({
      action: 'action1',
      userId: _user2._id
    });

    await permissionFactory({
      requiredActions: ['action1', 'action2'],
      userId: _user2._id,
      allowed: true
    });

    await permissionFactory({
      action: 'action3',
      groupId: _group._id,
      allowed: false
    });

    await permissionFactory({
      action: 'action3',
      groupId: _group._id,
      allowed: true
    });
  });

  afterEach(async () => {
    // Clearing test data
    await Users.deleteMany({});
    await Permissions.deleteMany({});
    await UsersGroups.deleteMany({});
  });

  test('Register module check duplicated module', async () => {
    registerModule({ moduleObj });

    expect.assertions(1);
    try {
      registerModule({ moduleObj });
    } catch (e) {
      expect(e.message).toEqual(
        `"${moduleObj.name}" module has been registered`
      );
    }
  });

  test('Register module check duplicated action', async () => {
    expect.assertions(1);
    try {
      registerModule({
        anyModule: {
          name: 'new module',
          description: 'd',
          actions: moduleObj.actions
        }
      });
    } catch (e) {
      expect(e.message).toEqual(
        `"${moduleObj.actions[0].name}" action has been registered`
      );
    }
  });

  test('Check permission is owner', async () => {
    const checkPermission = await can('action', _user);

    expect(checkPermission).toEqual(true);
  });

  test('Check permission', async () => {
    const checkPermission = await can('action1', _user2);

    expect(checkPermission).toEqual(true);
  });

  test('Check permission', async () => {
    const checkPermission = await can('action3', _user3);

    expect(checkPermission).toEqual(true);
  });
});
