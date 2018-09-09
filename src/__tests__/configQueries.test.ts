import { connect, disconnect, graphqlRequest } from '../db/connection';
import { configFactory } from '../db/factories';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('configQueries', () => {
  test('config detail', async () => {
    const config = await configFactory();

    const args = { code: config.code };

    const qry = `
      query configsDetail($code: String!) {
        configsDetail(code: $code) {
          _id
          code
          value
        }
      }
    `;

    const response = await graphqlRequest(qry, 'configsDetail', args);

    expect(response.code).toBe(config.code);
  });
});
