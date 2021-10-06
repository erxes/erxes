import './setup.ts';

import {
  permissionQueries,
  usersGroupQueries
} from '../data/resolvers/queries/permissions';
import { graphqlRequest } from '../db/connection';
import {
  permissionFactory,
  userFactory,
  usersGroupFactory
} from '../db/factories';
import { Permissions, Users, UsersGroups } from '../db/models';

describe('permissionQueries', () => {
  const commonParamDefs = `
    $module: String
    $action: String
    $userId: String
    $groupId: String
  `;

  const commonParams = `
    module: $module
    action: $action
    userId: $userId
    groupId: $groupId
  `;

  afterEach(async () => {
    // Clearing test data
    await Permissions.deleteMany({});
    await Users.deleteMany({});
  });

  test(`test if Error('Login required') exception is working as intended`, async () => {
    expect.assertions(4);

    const expectError = async func => {
      try {
        await func(null, {}, {});
      } catch (e) {
        expect(e.message).toBe('Login required');
      }
    };

    expectError(permissionQueries.permissions);
    expectError(permissionQueries.permissionModules);
    expectError(permissionQueries.permissionActions);
    expectError(permissionQueries.permissionsTotalCount);
  });

  test(`Permissions`, async () => {
    await permissionFactory();
    await permissionFactory();
    await permissionFactory();

    const qry = `
      query permissions($page: Int $perPage: Int ${commonParamDefs}) {
        permissions(page: $page perPage: $perPage ${commonParams}) {
          _id
        }
      }
    `;

    const response = await graphqlRequest(qry, 'permissions', {
      page: 1,
      perPage: 2
    });

    expect(response.length).toBe(2);
  });

  test(`Permissions by module`, async () => {
    await permissionFactory({ module: 'brands' });
    await permissionFactory({ module: 'brands' });
    await permissionFactory();

    const qry = `
      query permissions(${commonParamDefs}) {
        permissions(${commonParams}) {
          _id
        }
      }
    `;

    const response = await graphqlRequest(qry, 'permissions', {
      module: 'brands'
    });

    expect(response.length).toBe(2);
  });

  test(`Permissions by action`, async () => {
    await permissionFactory({ action: 'brandsAll' });
    await permissionFactory({ action: 'brandsAll' });
    await permissionFactory();

    const qry = `
      query permissions(${commonParamDefs}) {
        permissions(${commonParams}) {
          _id
        }
      }
    `;

    const response = await graphqlRequest(qry, 'permissions', {
      action: 'brandsAll'
    });

    expect(response.length).toBe(2);
  });

  test(`Permissions by userId`, async () => {
    const group = await usersGroupFactory({});
    await permissionFactory({ groupId: group._id });
    const user = await userFactory({ groupIds: [group._id] });

    await permissionFactory({ userId: user._id });
    await permissionFactory({ userId: user._id });
    await permissionFactory();

    const qry = `
      query permissions(${commonParamDefs}) {
        permissions(${commonParams}) {
          _id
        }
      }
    `;

    const response = await graphqlRequest(qry, 'permissions', {
      userId: user._id
    });

    expect(response.length).toBe(3);
  });

  test(`Permissions by groupId`, async () => {
    await permissionFactory({ groupId: 'groupId' });
    await permissionFactory({ groupId: 'groupId' });
    await permissionFactory();

    const qry = `
      query permissions(${commonParamDefs}) {
        permissions(${commonParams}) {
          _id
          user { _id }
          group { _id }
        }
      }
    `;

    const response = await graphqlRequest(qry, 'permissions', {
      groupId: 'groupId'
    });

    expect(response.length).toBe(2);
  });

  test(`Permissions total count`, async () => {
    await permissionFactory();
    await permissionFactory();
    await permissionFactory();

    const qry = `
      query permissionsTotalCount {
        permissionsTotalCount
      }
    `;

    const count = await graphqlRequest(qry, 'permissionsTotalCount');

    expect(count).toBe(3);
  });

  test(`Permissions modules`, async () => {
    const qry = `
      query permissionModules {
        permissionModules {
          name
          description
        }
      }
    `;

    const modules = await graphqlRequest(qry, 'permissionModules');

    expect(modules.length).toBe(31);
  });

  test(`Permissions actions`, async () => {
    const qry = `
      query permissionActions {
        permissionActions {
          name
          description
          module
        }
      }
    `;

    const modules = await graphqlRequest(qry, 'permissionActions');

    expect(modules.length).toBe(219);
  });
});

describe('usersGroupQueries', () => {
  afterEach(async () => {
    // Clearing test data
    await UsersGroups.deleteMany({});
  });

  test(`test if Error('Login required') exception is working as intended`, async () => {
    expect.assertions(2);

    const expectError = async func => {
      try {
        await func(null, {}, {});
      } catch (e) {
        expect(e.message).toBe('Login required');
      }
    };

    expectError(usersGroupQueries.usersGroups);
    expectError(usersGroupQueries.usersGroupsTotalCount);
  });

  test(`User groups`, async () => {
    await usersGroupFactory();
    await usersGroupFactory();
    const userGroup = await usersGroupFactory();

    await userFactory({ groupIds: [userGroup._id] });

    const qry = `
      query usersGroups($page: Int $perPage: Int) {
        usersGroups(page: $page perPage: $perPage) {
          _id
          memberIds
          members { _id }
        }
      }
    `;

    const response = await graphqlRequest(qry, 'usersGroups', {
      page: 1,
      perPage: 2
    });

    expect(response.length).toBe(2);
  });

  test(`User group total count`, async () => {
    await usersGroupFactory();
    await usersGroupFactory();
    await usersGroupFactory();

    const qry = `
      query usersGroupsTotalCount {
        usersGroupsTotalCount
      }
    `;

    const count = await graphqlRequest(qry, 'usersGroupsTotalCount');

    expect(count).toBe(3);
  });
});
