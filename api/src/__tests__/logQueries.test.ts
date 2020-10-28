import * as sinon from 'sinon';
import { MODULE_NAMES } from '../data/constants';
import * as utils from '../data/logUtils';
import { graphqlRequest } from '../db/connection';
import './setup.ts';

describe('log queries', () => {
  test('Logs', async () => {
    const mock = sinon.stub(utils, 'fetchLogs').callsFake(() => {
      return Promise.resolve({ logs: [], totalCount: 0 });
    });

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

    const response = await graphqlRequest(qry, 'logs', {});

    expect(response.logs).toHaveLength(0);
    expect(response.totalCount).toBe(0);

    mock.restore();
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

    const response = await graphqlRequest(query, 'getDbSchemaLabels', {
      type: MODULE_NAMES.BRAND
    });

    expect(response).toBeDefined();
  });
});
