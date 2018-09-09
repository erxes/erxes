import { connect, disconnect, graphqlRequest } from '../db/connection';
import { userFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Test configs mutations', () => {
  test('Insert config', async () => {
    const context = { user: await userFactory({ role: 'admin' }) };

    const args = {
      code: 'dealUOM',
      value: ['MNT'],
    };

    const mutation = `
      mutation configsInsert($code: String!, $value: [String]!) {
        configsInsert(code: $code, value: $value) {
          _id
          code
          value
        }
      }
    `;

    const config = await graphqlRequest(mutation, 'configsInsert', args, context);

    expect(config.value.length).toEqual(1);
    expect(config.value[0]).toEqual('MNT');
  });
});
