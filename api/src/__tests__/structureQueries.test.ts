import { graphqlRequest } from '../db/connection';
import { departmentFactory, unitFactory } from '../db/factories';

import './setup.ts';

describe('Department queries', () => {
  test('Get departments', async () => {
    await departmentFactory({});
    await departmentFactory({});

    const query = `
            query departments {
                departments {
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

    const response = await graphqlRequest(query, 'departments');

    expect(response.length).toBe(2);
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
