import utils from '../data/utils';
import { graphqlRequest } from '../db/connection';
import { importHistoryFactory, segmentFactory } from '../db/factories';
import { ImportHistory, Segments } from '../db/models';

import './setup.ts';

describe('Import history queries', () => {
  afterEach(async () => {
    // Clearing test data
    await ImportHistory.deleteMany({});

    await Segments.deleteMany({});
  });

  test('Import histories', async () => {
    await importHistoryFactory({ contentTypes: ['company'] });
    await importHistoryFactory({ contentTypes: ['customer'] });

    const qry = `
      query importHistories($type: String!) {
        importHistories(type: $type) {
          list {
            _id
            contentTypes
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
      type: 'customer'
    });

    expect(responses.list.length).toBe(1);
    expect(responses.count).toBe(1);

    // company ============================
    responses = await graphqlRequest(qry, 'importHistories', {
      type: 'company'
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

    const importHistory = await importHistoryFactory({
      errorMsgs: ['error messages']
    });

    let response = await graphqlRequest(qry, 'importHistoryDetail', {
      _id: importHistory._id
    });

    expect(response._id).toBe(importHistory._id);

    const importHistoryNoError = await importHistoryFactory({});

    response = await graphqlRequest(qry, 'importHistoryDetail', {
      _id: importHistoryNoError._id
    });

    expect(response._id).toBe(importHistoryNoError._id);
  });

  test('Import history get columns', async () => {
    const qry = `
      query importHistoryGetColumns($attachmentName: String) {
        importHistoryGetColumns(attachmentName: $attachmentName)
      }
    `;

    const spy = jest.spyOn(utils, 'getImportCsvInfo');

    spy.mockImplementation(async () => {
      return Promise.resolve([
        {
          name: 'name',
          city: 'city',
          score: '1'
        },
        {
          name: 'name1',
          city: 'city1',
          score: '2'
        }
      ]);
    });

    await graphqlRequest(qry, 'importHistoryGetColumns', {
      attachmentName: 'test'
    });

    spy.mockRestore();
  });

  test('Import history get dublicated headers', async () => {
    const qry = `
      query importHistoryGetDuplicatedHeaders($attachmentNames: [String]) {
        importHistoryGetDuplicatedHeaders(attachmentNames: $attachmentNames)
      }
    `;

    const spy = jest.spyOn(utils, 'getCsvHeadersInfo');

    spy.mockImplementation(async () => {
      return Promise.resolve('firstName, lastName');
    });

    await graphqlRequest(qry, 'importHistoryGetDuplicatedHeaders', {
      attachmentNames: ['test', 'test2']
    });

    spy.mockRestore();
  });

  test('Import history preview count', async () => {
    const qry = `
      query importHistoryPreviewExportCount($segmentId: String, $contentType: String!) {
        importHistoryPreviewExportCount(segmentId: $segmentId, contentType: $contentType)
      }
    `;

    const segment = await segmentFactory({});

    const contentTypes = [
      'customer',
      'lead',
      'visitor',
      'deal',
      'ticket',
      'task',
      'company'
    ];

    for (const contentType of contentTypes) {
      const response = await graphqlRequest(
        qry,
        'importHistoryPreviewExportCount',
        {
          contentType
        }
      );

      expect(response).toBe(0);
    }

    await graphqlRequest(qry, 'importHistoryPreviewExportCount', {
      segmentId: segment._id,
      contentType: 'customer'
    });
  });
});
