import { graphqlRequest } from '../db/connection';
import { boardFactory, dealFactory, pipelineFactory, productFactory, stageFactory, userFactory } from '../db/factories';
import { Boards, Pipelines, Stages } from '../db/models';

import moment = require('moment');
import { BOARD_TYPES, PIPELINE_VISIBLITIES, PROBABILITY } from '../db/models/definitions/constants';
import './setup.ts';

describe('boardQueries', () => {
  const commonBoardTypes = `
    _id
    name
    type
    pipelines {
      _id
    }
  `;

  const commonPipelineTypes = `
    _id
    name
    type
    visibility
    members { _id }
    isWatched
    state
    itemsTotalCount
  `;

  const commonStageTypes = `
    _id
    name
    type
    amount
    itemsTotalCount
    initialDealsTotalCount
    inProcessDealsTotalCount
    stayedDealsTotalCount
    compareNextStage
  `;

  const detailQuery = `
    query boardDetail($_id: String!) {
      boardDetail(_id: $_id) {
        ${commonBoardTypes}
      }
    }
  `;

  afterEach(async () => {
    // Clearing test data
    await Boards.deleteMany({});
    await Stages.deleteMany({});
    await Pipelines.deleteMany({});
  });

  test('Boards', async () => {
    await boardFactory();
    await boardFactory();
    await boardFactory();

    const qry = `
      query boards($type: String!) {
        boards(type: $type) {
          ${commonBoardTypes}
        }
      }
    `;

    const response = await graphqlRequest(qry, 'boards', { type: 'deal' });

    expect(response.length).toBe(3);
  });

  test('Board detail', async () => {
    const board = await boardFactory();

    const response = await graphqlRequest(detailQuery, 'boardDetail', { _id: board._id });

    expect(response._id).toBe(board._id);
    expect(response.name).toBe(board.name);
    expect(response.type).toBe(board.type);
    expect(response.pipelines.length).toBe(0);
  });

  test('Board detail (private pipeline)', async () => {
    const board = await boardFactory();

    await pipelineFactory({ boardId: board._id });
    await pipelineFactory({ boardId: board._id, visibility: 'private' });

    const user = await userFactory({ isOwner: false });
    const response = await graphqlRequest(detailQuery, 'boardDetail', { _id: board._id }, { user });

    expect(response.pipelines.length).toBe(1);
  });

  test('Board get last', async () => {
    const board = await boardFactory({ type: BOARD_TYPES.DEAL });

    const qry = `
      query boardGetLast($type: String!) {
        boardGetLast(type: $type) {
          ${commonBoardTypes}
        }
      }
    `;

    const response = await graphqlRequest(qry, 'boardGetLast', { type: BOARD_TYPES.DEAL });

    expect(board._id).toBe(response._id);
  });

  test('Pipelines', async () => {
    const board = await boardFactory();

    const args = { boardId: board._id };

    await pipelineFactory(args);
    await pipelineFactory(args);
    await pipelineFactory(args);

    const qry = `
      query pipelines($boardId: String!) {
        pipelines(boardId: $boardId) {
          ${commonPipelineTypes}
        }
      }
    `;

    const response = await graphqlRequest(qry, 'pipelines', args);

    expect(response.length).toBe(3);
  });

  test('Pipeline detail', async () => {
    const qry = `
      query pipelineDetail($_id: String!) {
        pipelineDetail(_id: $_id) {
          ${commonPipelineTypes}
        }
      }
    `;
    const user = await userFactory();

    const dealPipeline = await pipelineFactory({
      type: BOARD_TYPES.DEAL,
      visibility: PIPELINE_VISIBLITIES.PRIVATE,
      memberIds: [user._id],
      watchedUserIds: [user._id],
    });

    let response = await graphqlRequest(qry, 'pipelineDetail', { _id: dealPipeline._id }, { user });

    expect(response._id).toBe(dealPipeline._id);
    expect(response.visibility).toBe(PIPELINE_VISIBLITIES.PRIVATE);
    expect(response.members[0]._id).toBe(user._id);
    expect(response.isWatched).toBe(true);

    const ticketPipeline = await pipelineFactory({ type: BOARD_TYPES.TICKET });
    response = await graphqlRequest(qry, 'pipelineDetail', { _id: ticketPipeline._id });

    expect(response._id).toBe(ticketPipeline._id);
    expect(response.itemsTotalCount).toBe(0);

    const taskPipeline = await pipelineFactory({ type: BOARD_TYPES.TASK });
    response = await graphqlRequest(qry, 'pipelineDetail', { _id: taskPipeline._id });

    expect(response._id).toBe(taskPipeline._id);
    expect(response.itemsTotalCount).toBe(0);

    const growthHackPipeline = await pipelineFactory({ type: BOARD_TYPES.GROWTH_HACK });
    response = await graphqlRequest(qry, 'pipelineDetail', { _id: growthHackPipeline._id });

    expect(response._id).toBe(growthHackPipeline._id);
    expect(response.itemsTotalCount).toBe(0);
  });

  test('Get state by startDate and endDate', async () => {
    const qry = `
      query pipelineDetail($_id: String!) {
        pipelineDetail(_id: $_id) {
          ${commonPipelineTypes}
        }
      }
    `;
    const user = await userFactory();

    let startDate = new Date(
      moment()
        .add(-2, 'days')
        .format('YYYY-MM-DD'),
    );
    let endDate = new Date(
      moment()
        .add(-1, 'days')
        .format('YYYY-MM-DD'),
    );

    const completedPipeline = await pipelineFactory({ startDate, endDate });

    let response = await graphqlRequest(qry, 'pipelineDetail', { _id: completedPipeline._id }, { user });

    expect(response._id).toBe(completedPipeline._id);
    expect(response.state).toBe('Completed');

    startDate = new Date(
      moment()
        .add(-2, 'days')
        .format('YYYY-MM-DD'),
    );
    endDate = new Date(
      moment()
        .add(5, 'days')
        .format('YYYY-MM-DD'),
    );

    const inProgressPipeline = await pipelineFactory({ startDate, endDate });

    response = await graphqlRequest(qry, 'pipelineDetail', { _id: inProgressPipeline._id }, { user });

    expect(response._id).toBe(inProgressPipeline._id);
    expect(response.state).toBe('In progress');

    startDate = new Date(
      moment()
        .add(2, 'days')
        .format('YYYY-MM-DD'),
    );
    endDate = new Date(
      moment()
        .add(5, 'days')
        .format('YYYY-MM-DD'),
    );

    const notStartedPipeline = await pipelineFactory({ startDate, endDate });

    response = await graphqlRequest(qry, 'pipelineDetail', { _id: notStartedPipeline._id }, { user });

    expect(response._id).toBe(notStartedPipeline._id);
    expect(response.state).toBe('Not started');
  });

  test('Stages', async () => {
    const pipeline = await pipelineFactory();

    const args = { pipelineId: pipeline._id, probability: PROBABILITY.LOST };

    await stageFactory(args);
    await stageFactory(args);
    await stageFactory(args);

    const qry = `
      query stages($pipelineId: String!, $isNotLost: Boolean) {
        stages(pipelineId: $pipelineId, isNotLost: $isNotLost) {
          ${commonStageTypes}
        }
      }
    `;

    const filter = { pipelineId: pipeline._id, isNotLost: false };

    let response = await graphqlRequest(qry, 'stages', filter);

    expect(response.length).toBe(3);

    args.probability = PROBABILITY.WON;

    await stageFactory({ ...args, order: 1 });
    await stageFactory({ ...args, order: 2 });

    filter.isNotLost = true;
    response = await graphqlRequest(qry, 'stages', filter);

    expect(response.length).toBe(2);
  });

  test('Stage detail', async () => {
    const stage = await stageFactory();

    const args = { _id: stage._id };

    const qry = `
      query stageDetail($_id: String!) {
        stageDetail(_id: $_id) {
          ${commonStageTypes}
        }
      }
    `;

    const response = await graphqlRequest(qry, 'stageDetail', args);

    expect(response._id).toBe(stage._id);
  });

  test('Stage detail itemsTotalCount by type', async () => {
    const qry = `
      query stageDetail($_id: String!) {
        stageDetail(_id: $_id) {
          ${commonStageTypes}
        }
      }
    `;

    const dealStage = await stageFactory({ type: BOARD_TYPES.DEAL });
    let response = await graphqlRequest(qry, 'stageDetail', { _id: dealStage._id });

    expect(response._id).toBe(dealStage._id);

    const taskStage = await stageFactory({ type: BOARD_TYPES.TASK });
    response = await graphqlRequest(qry, 'stageDetail', { _id: taskStage._id });

    expect(response._id).toBe(taskStage._id);

    const ticketStage = await stageFactory({ type: BOARD_TYPES.TICKET });
    response = await graphqlRequest(qry, 'stageDetail', { _id: ticketStage._id });

    expect(response._id).toBe(ticketStage._id);

    const growthHackStage = await stageFactory({ type: BOARD_TYPES.GROWTH_HACK });
    response = await graphqlRequest(qry, 'stageDetail', { _id: growthHackStage._id });

    expect(response._id).toBe(growthHackStage._id);
  });

  test('Stage detail (amount)', async () => {
    const qry = `
      query stageDetail($_id: String!) {
        stageDetail(_id: $_id) {
          ${commonStageTypes}
        }
      }
    `;

    const stage = await stageFactory({ type: BOARD_TYPES.DEAL });

    const product = await productFactory();
    const productsData = [
      {
        productId: product._id,
        currency: 'USD',
        amount: 200,
      },
      {
        productId: product._id,
        currency: 'USD',
      },
      {
        productId: product._id,
      },
    ];

    await dealFactory({ productsData, stageId: stage._id });

    const response = await graphqlRequest(qry, 'stageDetail', { _id: stage._id });

    expect(response._id).toBe(stage._id);
  });
});
