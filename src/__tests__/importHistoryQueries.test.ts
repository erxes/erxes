import { connect, disconnect, graphqlRequest } from '../db/connection';
import { importHistoryFactory } from '../db/factories';
import { ImportHistory } from '../db/models';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('Import history queries', () => {
  afterEach(async () => {
    // Clearing test data
    await ImportHistory.remove({});
  });

  test('Import histories', async () => {
    await importHistoryFactory({ contentType: 'company' });
    await importHistoryFactory({ contentType: 'customer' });

    const qry = `
      query importHistories($type: String!) {
        importHistories(type: $type) {
          _id
          contentType
          date
          user {
            details {
              fullName
            }
          }
          success
          failed
          total
          ids
        }
      }
    `;

    // customer ===========================
    let responses = await graphqlRequest(qry, 'importHistories', {
      type: 'customer',
    });

    expect(responses.length).toBe(1);

    // company ============================
    responses = await graphqlRequest(qry, 'importHistories', {
      type: 'company',
    });

    expect(responses.length).toBe(1);
  });
});
