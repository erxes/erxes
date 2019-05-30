import { graphqlRequest } from '../db/connection';
import { importHistoryFactory } from '../db/factories';
import { ImportHistory } from '../db/models';

describe('Import history queries', () => {
  afterEach(async () => {
    // Clearing test data
    await ImportHistory.deleteMany({});
  });

  test('Import histories', async () => {
    await importHistoryFactory({ contentType: 'company' });
    await importHistoryFactory({ contentType: 'customer' });

    const qry = `
      query importHistories($type: String!) {
        importHistories(type: $type) {
          list {
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
          count
        }
      }
    `;

    // customer ===========================
    let responses = await graphqlRequest(qry, 'importHistories', {
      type: 'customer',
    });

    expect(responses.list.length).toBe(1);

    // company ============================
    responses = await graphqlRequest(qry, 'importHistories', {
      type: 'company',
    });

    expect(responses.list.length).toBe(1);
  });
});
