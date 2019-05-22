import * as sinon from 'sinon';
import { graphqlRequest } from '../db/connection';
import { customerFactory, importHistoryFactory, userFactory } from '../db/factories';
import { ImportHistory, Users } from '../db/models';
import * as workerUtils from '../workers/utils';

describe('Import history mutations', () => {
  let _user;
  let context;

  beforeEach(async () => {
    // Creating test data
    _user = await userFactory({});

    context = { user: _user };
  });

  afterEach(async () => {
    // Clearing test data
    await ImportHistory.deleteMany({});
    await Users.deleteMany({});
  });

  test('Remove import histories', async () => {
    const mutation = `
      mutation importHistoriesRemove($_id: String!) {
        importHistoriesRemove(_id: $_id)
      }
    `;
    const customer = await customerFactory({});

    const importHistory = await importHistoryFactory({
      ids: [customer._id],
    });

    const mock = sinon.stub(workerUtils, 'createWorkers').callsFake();

    await graphqlRequest(mutation, 'importHistoriesRemove', { _id: importHistory._id }, context);

    const historyObj = await ImportHistory.findOne({ _id: importHistory._id });

    if (!historyObj) {
      throw new Error('History not found');
    }

    expect(historyObj.status).toBe('Removing');

    mock.restore();
  });
});
