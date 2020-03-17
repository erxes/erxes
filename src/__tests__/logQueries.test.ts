import { MODULE_NAMES } from '../data/constants';
import { graphqlRequest } from '../db/connection';
import './setup.ts';

describe('log queries', () => {
  test('Logs', async () => {
    const qry = `
      query logs(
        $start: String
        $end: String
        $userId: String
        $action: String
        $page: Int
        $perPage: Int
      ) {
        logs(
          start: $start
          end: $end
          userId: $userId
          action: $action
          page: $page
          perPage: $perPage
        ) {
          logs {
            _id
          }
          totalCount
        }
      }
    `;

    process.env.LOGS_API_DOMAIN = '';

    const response = await graphqlRequest(qry, 'logs', {});

    expect(response.logs).toHaveLength(0);
    expect(response.totalCount).toBe(0);
  });

  test('getDbSchemaLabels', async () => {
    const query = `
      query getDbSchemaLabels($type: String) {
        getDbSchemaLabels(type: $type) {
          name
          label
        }
      }
    `;

    const response = await graphqlRequest(query, 'getDbSchemaLabels', { type: MODULE_NAMES.BRAND });

    expect(response).toBeDefined();
  });
});
