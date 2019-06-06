import * as moment from 'moment';
import { graphqlRequest } from '../db/connection';
import {
  companyFactory,
  customerFactory,
  dealBoardFactory,
  dealFactory,
  dealPipelineFactory,
  dealStageFactory,
  productFactory,
  userFactory,
} from '../db/factories';
import { DealBoards, DealPipelines, Deals, DealStages } from '../db/models';

import './setup.ts';

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

  const qryDealFilter = `
    query deals(
      $stageId: String 
      $assignedUserIds: [String]
      $customerIds: [String]
      $companyIds: [String]
      $productIds: [String]
      $nextDay: String
      $nextWeek: String
      $nextMonth: String
      $noCloseDate: String
      $overdue: String
    ) {
      deals(
        stageId: $stageId 
        customerIds: $customerIds
        assignedUserIds: $assignedUserIds
        companyIds: $companyIds
        productIds: $productIds
        nextDay: $nextDay
        nextWeek: $nextWeek
        nextMonth: $nextMonth
        noCloseDate: $noCloseDate
        overdue: $overdue
      ) {
        ${commonDealTypes}
      }
    }
  `;

  afterEach(async () => {
    // Clearing test data
    await DealBoards.deleteMany({});
    await DealStages.deleteMany({});
    await DealPipelines.deleteMany({});
    await Deals.deleteMany({});
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

  test('Filter by next day', async () => {
    const tomorrow = moment()
      .add(1, 'day')
      .endOf('day')
      .format('YYYY-MM-DD');

    await dealFactory({ closeDate: new Date(tomorrow) });

    const response = await graphqlRequest(qryDealFilter, 'deals', { nextDay: 'true' });

    expect(response.length).toBe(1);
  });

  test('Deal filter by next week', async () => {
    const nextWeek = moment()
      .day(8)
      .format('YYYY-MM-DD');

    await dealFactory({ closeDate: new Date(nextWeek) });

    const response = await graphqlRequest(qryDealFilter, 'deals', { nextWeek: 'true' });

    expect(response.length).toBe(1);
  });

  test('Deal filter by next month', async () => {
    const nextMonth = moment()
      .add(1, 'months')
      .format('YYYY-MM-01');

    await dealFactory({ closeDate: new Date(nextMonth) });

    const response = await graphqlRequest(qryDealFilter, 'deals', { nextMonth: 'true' });

    expect(response.length).toBe(1);
  });

  test('Deal filter by has no close date', async () => {
    await dealFactory({ noCloseDate: true });

    const response = await graphqlRequest(qryDealFilter, 'deals', { noCloseDate: 'true' });

    expect(response.length).toBe(1);
  });

  test('Deal filter by overdue', async () => {
    const yesterday = moment()
      .utc()
      .subtract(1, 'days')
      .toDate();

    await dealFactory({ closeDate: yesterday });

    const response = await graphqlRequest(qryDealFilter, 'deals', { overdue: 'true' });

    expect(response.length).toBe(1);
  });

  test('Deal filter by products', async () => {
    const { productId } = await productFactory();

    await dealFactory({ productsData: { productId } });

    const response = await graphqlRequest(qryDealFilter, 'deals', { productIds: [productId] });

    expect(response.length).toBe(1);
  });

  test('Deal filter by team members', async () => {
    const { _id } = await userFactory();

    await dealFactory({ assignedUserIds: [_id] });

    const response = await graphqlRequest(qryDealFilter, 'deals', { assignedUserIds: [_id] });

    expect(response.length).toBe(1);
  });

  test('Deal filter by customers', async () => {
    const { _id } = await customerFactory();

    await dealFactory({ customerIds: [_id] });

    const response = await graphqlRequest(qryDealFilter, 'deals', { customerIds: [_id] });

    expect(response.length).toBe(1);
  });

  test('Deal filter by companies', async () => {
    const { _id } = await companyFactory();

    await dealFactory({ companyIds: [_id] });

    const response = await graphqlRequest(qryDealFilter, 'deals', { companyIds: [_id] });

    expect(response.length).toBe(1);
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
