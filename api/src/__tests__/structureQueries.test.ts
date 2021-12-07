import { graphqlRequest } from '../db/connection';
import {
  branchFactory,
  departmentFactory,
  structureFactory,
  unitFactory,
  userFactory
} from '../db/factories';
import { Users } from '../db/models';

import './setup.ts';

describe('Structure queries', () => {
  afterEach(async () => {
    await Users.deleteMany({});
  });

  test('Get structure', async () => {
    await structureFactory({});

    const query = `
          query structureDetail {
              structureDetail {
                  _id
                  title
                  supervisor {
                    _id
                  }
              }
          }
      `;

    const response = await graphqlRequest(query, 'structureDetail');

    expect(response).toBeDefined();
  });

  test('Get departments', async () => {
    const parent = await departmentFactory({});
    await departmentFactory({
      parentId: parent._id,
      title: 'This is Example title'
    });

    const query = `
            query departments($searchValue: String) {
                departments(searchValue: $searchValue) {
                    _id
                    users {
                        _id
                    }
                    parent {
                      _id
                    }
                    children {
                      _id
                    }
                    supervisor {
                      _id
                    }
                }
            }
        `;

    let response = await graphqlRequest(query, 'departments');

    expect(response.length).toBe(2);

    response = await graphqlRequest(query, 'departments', {
      searchValue: 'example'
    });

    expect(response.length).toBe(1);
  });

  test('Get department', async () => {
    const department = await departmentFactory({});

    const query = `
            query departmentDetail($_id: String!) {
                departmentDetail(_id: $_id) {
                    _id
                    title
                }
            }
        `;

    const response = await graphqlRequest(query, 'departmentDetail', {
      _id: department._id
    });

    expect(response).toBeDefined();
  });

  test('Get units', async () => {
    await unitFactory({});
    await unitFactory({ title: 'This is Example title' });

    const query = `
          query units($searchValue: String) {
              units(searchValue: $searchValue) {
                  _id
                  users {
                      _id
                  }
                  department {
                    _id
                  }
                  supervisor {
                    _id
                  }
              }
          }
      `;

    let response = await graphqlRequest(query, 'units');

    expect(response.length).toBe(2);

    response = await graphqlRequest(query, 'units', { searchValue: 'example' });

    expect(response.length).toBe(1);
  });

  test('Get unit', async () => {
    const unit = await unitFactory({});

    const query = `
          query unitDetail($_id: String!) {
              unitDetail(_id: $_id) {
                  _id
                  title
              }
          }
      `;

    const response = await graphqlRequest(query, 'unitDetail', {
      _id: unit._id
    });

    expect(response).toBeDefined();
  });

  test('noDepartmentUsers', async () => {
    const supervisor = await userFactory({});
    const user1 = await userFactory({});
    const user2 = await userFactory({});

    await departmentFactory({});
    await departmentFactory({ userIds: [user1._id] });
    const departmentWithSupervisor = await departmentFactory({
      supervisorId: supervisor._id
    });

    const query = `
        query noDepartmentUsers($excludeId: String) {
            noDepartmentUsers(excludeId: $excludeId) {
                _id
            }
        }
    `;

    const response = await graphqlRequest(
      query,
      'noDepartmentUsers',
      {},
      {
        user: supervisor
      }
    );

    expect(response).toHaveLength(1);
    expect(response[0]._id).toBe(user2._id);

    const excludeUserResponse = await graphqlRequest(
      query,
      'noDepartmentUsers',
      { excludeId: departmentWithSupervisor._id },
      {
        user: supervisor
      }
    );

    expect(excludeUserResponse).toHaveLength(2);
    expect(excludeUserResponse.map(r => r._id)).not.toContain(
      departmentWithSupervisor._id
    );
  });

  test('Branches', async () => {
    const parent = await branchFactory({});
    await branchFactory({ parentId: parent._id });
    await branchFactory({
      parentId: parent._id,
      title: 'This is Example title'
    });

    const query = `
          query branches($searchValue: String) {
              branches(searchValue: $searchValue) {
                  _id
                  users {
                      _id
                  }
                  parent {
                    _id
                  }
                  children {
                    _id
                  }
                  supervisor {
                    _id
                  }
              }
          }
      `;

    const response = await graphqlRequest(query, 'branches');

    expect(response.length).toBe(3);

    const searchValueResponse = await graphqlRequest(query, 'branches', {
      searchValue: 'example'
    });

    expect(searchValueResponse.length).toBe(1);
  });

  test('Get branch', async () => {
    const branch = await branchFactory({});

    const query = `
          query branchDetail($_id: String!) {
              branchDetail(_id: $_id) {
                  _id
                  title
              }
          }
      `;

    const response = await graphqlRequest(query, 'branchDetail', {
      _id: branch._id
    });

    expect(response).toBeDefined();
  });
});
