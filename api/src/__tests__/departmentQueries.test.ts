import { graphqlRequest } from '../db/connection';
import { departmentFactory } from '../db/factories';

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
});
