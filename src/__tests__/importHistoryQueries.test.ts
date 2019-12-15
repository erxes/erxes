import { graphqlRequest } from '../db/connection';
import { importHistoryFactory } from '../db/factories';
import { ImportHistory } from '../db/models';

import './setup.ts';

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
    expect(responses.count).toBe(1);

    // company ============================
    responses = await graphqlRequest(qry, 'importHistories', {
      type: 'company',
    });

    expect(responses.list.length).toBe(1);
    expect(responses.count).toBe(1);
  });

  test('Import history detail', async () => {
    const qry = `
      query importHistoryDetail($_id: String!) {
        importHistoryDetail(_id: $_id) {
          _id
          user { _id }
        }
      }
    `;

    const importHistory = await importHistoryFactory({ errorMsgs: ['error messages'] });

    let response = await graphqlRequest(qry, 'importHistoryDetail', { _id: importHistory._id });

    expect(response._id).toBe(importHistory._id);

    const importHistoryNoError = await importHistoryFactory({});

    response = await graphqlRequest(qry, 'importHistoryDetail', { _id: importHistoryNoError._id });

    expect(response._id).toBe(importHistoryNoError._id);
  });
});
