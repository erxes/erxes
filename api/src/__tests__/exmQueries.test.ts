import { graphqlRequest } from '../db/connection';
import { exmFactory } from '../db/factories';
import { Exms } from '../db/models';

import './setup.ts';

describe('Exm queries', () => {
    afterEach(async () => {
        // Clearing test data
        await Exms.deleteMany({});
      });
    
    test('Get exms', async () => {
      await exmFactory({});
      await exmFactory({});

      const query = `
        query exms {
            exms {
                list {
                    _id
                }
            }
        }
      `;

      const response = await graphqlRequest(query, 'exms');
    
      expect(response.list.length).toBe(2);
    });

    test('Get exm', async () => {
        const exm = await exmFactory({});

        const query = `
            query exmDetail($_id: String!) {
                exmDetail(_id: $_id) {
                    _id
                    name
                }
            }
        `;

        const response = await graphqlRequest(query, 'exmDetail', { _id: exm._id });
      
        expect(response).toBeDefined();
    });

    test('Get last exm', async () => {
        const exm = await exmFactory({});

        const query = `
            query exmGetLast {
                exmGetLast {
                    _id
                    name
                }
            }
        `;

        const response = await graphqlRequest(query, 'exmGetLast', { _id: exm._id });
      
        expect(response).toBeDefined();
    });
})