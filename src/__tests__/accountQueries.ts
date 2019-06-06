import { graphqlRequest } from '../db/connection';
import { accountFactory } from '../db/factories';
import { Accounts } from '../db/models';

import './setup.ts';

describe('accountQueries', () => {
  afterEach(async () => {
    // Clearing test data
    await Accounts.deleteMany({});
  });

  test('Accounts', async () => {
    const args = {
      kind: 'gmail',
    };

    await accountFactory({
      name: 'admin@erxes.io',
      kind: 'gmail',
    });

    await accountFactory({
      name: 'erxes Inc',
      kind: 'facebook',
    });

    const qry = `
      query accounts($kind: String) {
        accounts(kind: $kind) {
          _id
          kind
          name
        }
      }
    `;

    const response = await graphqlRequest(qry, 'accounts', args);
    const account = response[0];
    expect(account.name).toBe('admin@erxes.io');
    expect(account.kind).toBe('gmail');
    expect(response.length).toBe(1);

    const responses = await graphqlRequest(qry, 'accounts', {});
    expect(responses.length).toBe(2);
  });
});
