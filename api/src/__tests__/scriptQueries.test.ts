import { graphqlRequest } from '../db/connection';
import { Scripts } from '../db/models';

import { scriptFactory } from '../db/factories';
import './setup.ts';

describe('responseTemplateQueries', () => {
  beforeEach(async () => {
    // Clearing test data
    await scriptFactory({});
    await scriptFactory({});
    await scriptFactory({});
  });

  afterEach(async () => {
    // Clearing test data
    await Scripts.deleteMany({});
  });

  test('Scripts', async () => {
    const qry = `
      query scripts($page: Int, $perPage: Int) {
        scripts(page: $page, perPage: $perPage) {
          _id
          messenger { _id }
          kbTopic { _id }
          leads { _id }
        }
      }
    `;

    const response = await graphqlRequest(qry, 'scripts', {
      page: 1,
      perPage: 2
    });

    expect(response.length).toBe(2);
  });

  test('Get total count of script', async () => {
    const qry = `
      query scriptsTotalCount {
        scriptsTotalCount
      }
    `;

    const totalCount = await graphqlRequest(qry, 'scriptsTotalCount');

    expect(totalCount).toBe(3);
  });
});
