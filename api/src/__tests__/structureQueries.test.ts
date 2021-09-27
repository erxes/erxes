import { graphqlRequest } from '../db/connection';
import { departmentFactory, unitFactory } from '../db/factories';

import './setup.ts';

describe('Department queries', () => {
  test('Get departments', async () => {
    const parent = await departmentFactory({});
    await departmentFactory({ parentId: parent._id });

    const query = `
            query departments($depthType: String) {
                departments(depthType: $depthType) {
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
                }
            }
        `;

    let response = await graphqlRequest(query, 'departments');

    expect(response.length).toBe(2);

    response = await graphqlRequest(query, 'departments', {
      depthType: 'children'
    });

    expect(response.length).toBe(1);

    response = await graphqlRequest(query, 'departments', {
      depthType: 'parent'
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
    await unitFactory({});

    const query = `
          query units {
              units {
                  _id
                  users {
                      _id
                  }
                  department {
                    _id
                  }
              }
          }
      `;

    const response = await graphqlRequest(query, 'units');

    expect(response.length).toBe(2);
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
});
