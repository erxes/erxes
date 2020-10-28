import { graphqlRequest } from '../db/connection';
import { customerFactory, importHistoryFactory } from '../db/factories';
import { ImportHistory } from '../db/models';
import messageBroker from '../messageBroker';

import './setup.ts';

describe('Import history mutations', () => {
  afterEach(async () => {
    // Clearing test data
    await ImportHistory.deleteMany({});
  });

  test('Remove import histories', async () => {
    const mutation = `
      mutation importHistoriesRemove($_id: String!) {
        importHistoriesRemove(_id: $_id)
      }
    `;

    const spy = jest.spyOn(messageBroker(), 'sendRPCMessage');
    spy.mockImplementation(() => Promise.resolve({ status: 'ok' }));

    const customer = await customerFactory({});

    const customerHistory = await importHistoryFactory({
      ids: [customer._id],
      contentType: 'customer'
    });

    await graphqlRequest(mutation, 'importHistoriesRemove', {
      _id: customerHistory._id
    });
    const historyObj = await ImportHistory.getImportHistory(
      customerHistory._id
    );

    expect(historyObj.status).toBe('Removing');

    spy.mockRestore();
  });

  test('Remove import histories (Error)', async () => {
    const mutation = `
      mutation importHistoriesRemove($_id: String!) {
        importHistoriesRemove(_id: $_id)
      }
    `;

    const spy = jest.spyOn(messageBroker(), 'sendRPCMessage');
    spy.mockImplementation(() =>
      Promise.resolve({ status: 'error', message: 'Workers are busy' })
    );

    const customer = await customerFactory({});
    const importHistory = await importHistoryFactory({ ids: [customer._id] });

    try {
      await graphqlRequest(mutation, 'importHistoriesRemove', {
        _id: importHistory._id
      });
    } catch (e) {
      expect(e[0].message).toBe('Workers are busy');
    }

    spy.mockRestore();
  });

  test('Cancel import history', async () => {
    const mutation = `
      mutation importHistoriesCancel($_id: String!) {
        importHistoriesCancel(_id: $_id)
      }
    `;

    const importHistory = await importHistoryFactory({});

    const response = await graphqlRequest(mutation, 'importHistoriesCancel', {
      _id: importHistory._id
    });

    expect(response).toBe(true);
  });
});
