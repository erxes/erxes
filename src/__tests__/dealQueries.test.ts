import { connect, disconnect, graphqlRequest } from '../db/connection';
import { dealBoardFactory, dealFactory, dealPipelineFactory, dealStageFactory } from '../db/factories';
import { DealBoards, DealPipelines, Deals, DealStages } from '../db/models';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('dealQueries', () => {
  const commonBoardTypes = `
    _id
    name
  `;

  const commonPipelineTypes = `
    _id
    name
  `;

  const commonStageTypes = `
    _id
    name
  `;

  const commonDealTypes = `
    _id
    name
    stageId
    companyIds
    customerIds
    assignedUserIds
    amount
    closeDate
    description
    companies {
      _id
    }
    customers {
      _id
    }
    products
    productsData
    assignedUsers {
      _id
    }
  `;

  afterEach(async () => {
    // Clearing test data
    await DealBoards.remove({});
    await DealStages.remove({});
    await DealPipelines.remove({});
    await Deals.remove({});
  });

  test('Boards', async () => {
    await dealBoardFactory();
    await dealBoardFactory();
    await dealBoardFactory();

    const qry = `
      query dealBoards {
        dealBoards {
          ${commonBoardTypes}
        }
      }
    `;

    const response = await graphqlRequest(qry, 'dealBoards');

    expect(response.length).toBe(3);
  });

  test('Board detail', async () => {
    const board = await dealBoardFactory();

    const args = { _id: board._id };

    const qry = `
      query dealBoardDetail($_id: String!) {
        dealBoardDetail(_id: $_id) {
          ${commonBoardTypes}
        }
      }
    `;

    const response = await graphqlRequest(qry, 'dealBoardDetail', args);

    expect(response._id).toBe(board._id);
  });

  test('Board get last', async () => {
    const board = await dealBoardFactory();

    const qry = `
      query dealBoardGetLast {
        dealBoardGetLast {
          ${commonBoardTypes}
        }
      }
    `;

    const response = await graphqlRequest(qry, 'dealBoardGetLast');

    expect(board._id).toBe(response._id);
  });

  test('Pipelines', async () => {
    const board = await dealBoardFactory();

    const args = { boardId: board._id };

    await dealPipelineFactory(args);
    await dealPipelineFactory(args);
    await dealPipelineFactory(args);

    const qry = `
      query dealPipelines($boardId: String!) {
        dealPipelines(boardId: $boardId) {
          ${commonPipelineTypes}
        }
      }
    `;

    const response = await graphqlRequest(qry, 'dealPipelines', args);

    expect(response.length).toBe(3);
  });

  test('Stages', async () => {
    const pipeline = await dealPipelineFactory();

    const args = { pipelineId: pipeline._id };

    await dealStageFactory(args);
    await dealStageFactory(args);
    await dealStageFactory(args);

    const qry = `
      query dealStages($pipelineId: String!) {
        dealStages(pipelineId: $pipelineId) {
          ${commonStageTypes}
        }
      }
    `;

    const response = await graphqlRequest(qry, 'dealStages', args);

    expect(response.length).toBe(3);
  });

  test('Stage detail', async () => {
    const stage = await dealStageFactory();

    const args = { _id: stage._id };

    const qry = `
      query dealStageDetail($_id: String!) {
        dealStageDetail(_id: $_id) {
          ${commonStageTypes}
        }
      }
    `;

    const response = await graphqlRequest(qry, 'dealStageDetail', args);

    expect(response._id).toBe(stage._id);
  });

  test('Deals', async () => {
    const stage = await dealStageFactory();

    const args = { stageId: stage._id };

    await dealFactory(args);
    await dealFactory(args);
    await dealFactory(args);

    const qry = `
      query deals($stageId: String!) {
        deals(stageId: $stageId) {
          ${commonDealTypes}
        }
      }
    `;

    const response = await graphqlRequest(qry, 'deals', args);

    expect(response.length).toBe(3);
  });

  test('Deal detail', async () => {
    const deal = await dealFactory();

    const args = { _id: deal._id };

    const qry = `
      query dealDetail($_id: String!) {
        dealDetail(_id: $_id) {
          ${commonDealTypes}
        }
      }
    `;

    const response = await graphqlRequest(qry, 'dealDetail', args);

    expect(response._id).toBe(deal._id);
  });
});
