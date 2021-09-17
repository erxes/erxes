import * as sinon from 'sinon';
import { graphqlRequest } from '../db/connection';
import {
  boardFactory,
  conversationFactory,
  dealFactory,
  pipelineFactory,
  productFactory,
  segmentFactory,
  stageFactory,
  taskFactory,
  ticketFactory,
  userFactory
} from '../db/factories';
import { Boards, Pipelines, Stages } from '../db/models';
import * as elk from '../elasticsearch';

import moment = require('moment');
import {
  BOARD_STATUSES,
  BOARD_TYPES,
  PIPELINE_VISIBLITIES,
  PROBABILITY
} from '../db/models/definitions/constants';
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

  const pipelineQry = `
    query pipelines($boardId: String, $type: String, $perPage: Int, $page: Int) {
      pipelines(boardId: $boardId, type: $type, perPage: $perPage, page: $page) {
        ${commonPipelineTypes}
      }
    }
  `;

  const stateCountQry = `
    query pipelineStateCount($boardId: String, $type: String) {
      pipelineStateCount(boardId: $boardId, type: $type)
    }
  `;

  const dateBuilder = day =>
    new Date(
      moment()
        .add(day, 'days')
        .format('YYYY-MM-DD')
    );

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

  test('Board count', async () => {
    const boardOne = await boardFactory({ name: 'A' });
    await pipelineFactory({ boardId: boardOne._id });
    await pipelineFactory({ boardId: boardOne._id });

    const boardTwo = await boardFactory({ name: 'B' });
    await pipelineFactory({ boardId: boardTwo._id });

    const boardThree = await boardFactory({ name: 'C' });

    const qry = `
      query boardCounts($type: String!) {
        boardCounts(type: $type) {
          _id
          name
          count
        }
      }
    `;

    const response = await graphqlRequest(qry, 'boardCounts', { type: 'deal' });

    expect(response[0].name).toBe('All');
    expect(response[0].count).toBe(3);

    expect(response[1].name).toBe(boardOne.name);
    expect(response[1].count).toBe(2);

    expect(response[2].name).toBe(boardTwo.name);
    expect(response[2].count).toBe(1);

    expect(response[3].name).toBe(boardThree.name);
    expect(response[3].count).toBe(0);
  });

  test('Board detail', async () => {
    const board = await boardFactory();

    const response = await graphqlRequest(detailQuery, 'boardDetail', {
      _id: board._id
    });

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
    const response = await graphqlRequest(
      detailQuery,
      'boardDetail',
      { _id: board._id },
      { user }
    );

    expect(response.pipelines.length).toBe(1);
  });

  test('Board get last', async () => {
    const board = await boardFactory();

    const qry = `
      query boardGetLast($type: String!) {
        boardGetLast(type: $type) {
          ${commonBoardTypes}
        }
      }
    `;

    const response = await graphqlRequest(qry, 'boardGetLast', {
      type: BOARD_TYPES.DEAL
    });

    expect(board._id).toBe(response._id);
  });

  test('Pipelines', async () => {
    await pipelineFactory();
    await pipelineFactory();
    await pipelineFactory();

    const response = await graphqlRequest(pipelineQry, 'pipelines');

    expect(response.length).toBe(3);
  });

  test('Pipelines with filter', async () => {
    const board = await boardFactory();
    const args = { boardId: board._id, type: 'deal' };

    await pipelineFactory(args);
    await pipelineFactory(args);
    await pipelineFactory();

    const response = await graphqlRequest(pipelineQry, 'pipelines', args);

    expect(response.length).toBe(2);
  });

  test('Pipelines with pagination', async () => {
    const board = await boardFactory();
    const args = { boardId: board._id, type: 'deal' };

    await pipelineFactory(args);
    await pipelineFactory(args);
    await pipelineFactory(args);

    const response = await graphqlRequest(pipelineQry, 'pipelines', {
      ...args,
      perPage: 2,
      page: 1
    });

    expect(response.length).toBe(2);
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
      watchedUserIds: [user._id]
    });

    let response = await graphqlRequest(
      qry,
      'pipelineDetail',
      { _id: dealPipeline._id },
      { user }
    );

    expect(response._id).toBe(dealPipeline._id);
    expect(response.visibility).toBe(PIPELINE_VISIBLITIES.PRIVATE);
    expect(response.members[0]._id).toBe(user._id);
    expect(response.isWatched).toBe(true);

    const ticketPipeline = await pipelineFactory({ type: BOARD_TYPES.TICKET });
    response = await graphqlRequest(qry, 'pipelineDetail', {
      _id: ticketPipeline._id
    });

    expect(response._id).toBe(ticketPipeline._id);
    expect(response.itemsTotalCount).toBe(0);

    const taskPipeline = await pipelineFactory({ type: BOARD_TYPES.TASK });
    response = await graphqlRequest(qry, 'pipelineDetail', {
      _id: taskPipeline._id
    });

    expect(response._id).toBe(taskPipeline._id);
    expect(response.itemsTotalCount).toBe(0);

    const growthHackPipeline = await pipelineFactory({
      type: BOARD_TYPES.GROWTH_HACK
    });
    response = await graphqlRequest(qry, 'pipelineDetail', {
      _id: growthHackPipeline._id
    });

    expect(response._id).toBe(growthHackPipeline._id);
    expect(response.itemsTotalCount).toBe(0);
  });

  test('Get assigned users related pipeline', async () => {
    const qry = `
      query pipelineAssignedUsers($_id: String!) {
        pipelineAssignedUsers(_id: $_id) {
          _id
        }
      }
    `;

    const user = await userFactory();
    const pipeline = await pipelineFactory();
    const stage = await stageFactory({ pipelineId: pipeline._id });
    await dealFactory({ stageId: stage._id, assignedUserIds: [user._id] });

    const response = await graphqlRequest(qry, 'pipelineAssignedUsers', {
      _id: pipeline._id
    });

    expect(response[0]._id).toBe(user._id);
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
        .format('YYYY-MM-DD')
    );
    let endDate = new Date(
      moment()
        .add(-1, 'days')
        .format('YYYY-MM-DD')
    );

    const completedPipeline = await pipelineFactory({ startDate, endDate });

    let response = await graphqlRequest(
      qry,
      'pipelineDetail',
      { _id: completedPipeline._id },
      { user }
    );

    expect(response._id).toBe(completedPipeline._id);
    expect(response.state).toBe('Completed');

    startDate = new Date(
      moment()
        .add(-2, 'days')
        .format('YYYY-MM-DD')
    );
    endDate = new Date(
      moment()
        .add(5, 'days')
        .format('YYYY-MM-DD')
    );

    const inProgressPipeline = await pipelineFactory({ startDate, endDate });

    response = await graphqlRequest(
      qry,
      'pipelineDetail',
      { _id: inProgressPipeline._id },
      { user }
    );

    expect(response._id).toBe(inProgressPipeline._id);
    expect(response.state).toBe('In progress');

    startDate = new Date(
      moment()
        .add(2, 'days')
        .format('YYYY-MM-DD')
    );
    endDate = new Date(
      moment()
        .add(5, 'days')
        .format('YYYY-MM-DD')
    );

    const notStartedPipeline = await pipelineFactory({ startDate, endDate });

    response = await graphqlRequest(
      qry,
      'pipelineDetail',
      { _id: notStartedPipeline._id },
      { user }
    );

    expect(response._id).toBe(notStartedPipeline._id);
    expect(response.state).toBe('Not started');
  });

  test('Stages', async () => {
    const pipeline = await pipelineFactory();

    const args = {
      pipelineId: pipeline._id,
      probability: PROBABILITY.LOST,
      status: BOARD_STATUSES.ACTIVE
    };

    await stageFactory(args);
    await stageFactory(args);
    await stageFactory(args);

    const qry = `
      query stages($pipelineId: String!, $isNotLost: Boolean, $isAll: Boolean) {
        stages(pipelineId: $pipelineId, isNotLost: $isNotLost, isAll: $isAll) {
          ${commonStageTypes}
        }
      }
    `;

    const filter = { pipelineId: pipeline._id, isNotLost: false, isAll: false };

    let response = await graphqlRequest(qry, 'stages', filter);

    expect(response.length).toBe(3);

    args.probability = PROBABILITY.WON;

    await stageFactory({ ...args, order: 1 });
    await stageFactory({ ...args, order: 2 });

    filter.isNotLost = true;
    response = await graphqlRequest(qry, 'stages', filter);

    expect(response.length).toBe(2);

    args.status = BOARD_STATUSES.ARCHIVED;

    await stageFactory(args);

    filter.isAll = true;
    response = await graphqlRequest(qry, 'stages', filter);

    expect(response.length).toBe(3);
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
    let response = await graphqlRequest(qry, 'stageDetail', {
      _id: dealStage._id
    });

    expect(response._id).toBe(dealStage._id);

    const taskStage = await stageFactory({ type: BOARD_TYPES.TASK });
    response = await graphqlRequest(qry, 'stageDetail', { _id: taskStage._id });

    expect(response._id).toBe(taskStage._id);

    const ticketStage = await stageFactory({ type: BOARD_TYPES.TICKET });
    response = await graphqlRequest(qry, 'stageDetail', {
      _id: ticketStage._id
    });

    expect(response._id).toBe(ticketStage._id);

    const growthHackStage = await stageFactory({
      type: BOARD_TYPES.GROWTH_HACK
    });
    response = await graphqlRequest(qry, 'stageDetail', {
      _id: growthHackStage._id
    });

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
        tickUsed: true
      },
      {
        productId: product._id,
        currency: 'USD'
      },
      {
        productId: product._id
      }
    ];

    await dealFactory({ productsData, stageId: stage._id });

    const response = await graphqlRequest(qry, 'stageDetail', {
      _id: stage._id
    });

    expect(response._id).toBe(stage._id);
  });

  test('Pipeline state count', async () => {
    //  Not started pipelines
    await pipelineFactory({
      startDate: dateBuilder(1),
      endDate: dateBuilder(2)
    });
    await pipelineFactory({
      startDate: dateBuilder(2),
      endDate: dateBuilder(3)
    });

    //  In progress pipelines
    await pipelineFactory({
      startDate: dateBuilder(-1),
      endDate: dateBuilder(1)
    });
    await pipelineFactory({
      startDate: dateBuilder(-2),
      endDate: dateBuilder(2)
    });

    //  Not started pipelines
    await pipelineFactory({
      startDate: dateBuilder(-2),
      endDate: dateBuilder(-1)
    });

    const response = await graphqlRequest(stateCountQry, 'pipelineStateCount', {
      type: BOARD_TYPES.DEAL
    });

    expect(response.All).toBe(5);
    expect(response['Not started']).toBe(2);
    expect(response['In progress']).toBe(2);
    expect(response.Completed).toBe(1);
  });

  test('Pipeline state count with boardId', async () => {
    const board = await pipelineFactory({});

    //  Not started pipelines
    await pipelineFactory({
      startDate: dateBuilder(3),
      endDate: dateBuilder(5),
      boardId: board._id
    });

    //  In progress pipelines
    await pipelineFactory({
      startDate: dateBuilder(-3),
      endDate: dateBuilder(3),
      boardId: board._id
    });

    //  Not started pipelines
    await pipelineFactory({
      startDate: dateBuilder(-4),
      endDate: dateBuilder(-3),
      boardId: board._id
    });
    await pipelineFactory({
      startDate: dateBuilder(-5),
      endDate: dateBuilder(-2)
    });

    const response = await graphqlRequest(stateCountQry, 'pipelineStateCount', {
      boardId: board._id
    });

    expect(response.All).toBe(3);
    expect(response['Not started']).toBe(1);
    expect(response['In progress']).toBe(1);
    expect(response.Completed).toBe(1);
  });

  test('Convert to info', async () => {
    const conversation = await conversationFactory();

    const qry = `
      query convertToInfo($conversationId: String!) {
        convertToInfo(conversationId: $conversationId) {
          dealUrl
          ticketUrl
          taskUrl
        }
      }
    `;

    const dealBoard = await boardFactory({ type: BOARD_TYPES.DEAL });
    const dealPipeline = await pipelineFactory({
      type: BOARD_TYPES.DEAL,
      boardId: dealBoard._id
    });
    const dealStage = await stageFactory({
      type: BOARD_TYPES.DEAL,
      pipelineId: dealPipeline._id
    });

    const deal = await dealFactory({
      sourceConversationIds: [conversation._id],
      stageId: dealStage._id
    });

    const taskBoard = await boardFactory({ type: BOARD_TYPES.TASK });
    const taskPipeline = await pipelineFactory({
      type: BOARD_TYPES.TASK,
      boardId: taskBoard._id
    });
    const taskStage = await stageFactory({
      type: BOARD_TYPES.TASK,
      pipelineId: taskPipeline._id
    });
    const task = await taskFactory({
      sourceConversationIds: [conversation._id],
      stageId: taskStage._id
    });

    const ticketBoard = await boardFactory({ type: BOARD_TYPES.DEAL });
    const ticketPipeline = await pipelineFactory({
      type: BOARD_TYPES.DEAL,
      boardId: ticketBoard._id
    });
    const ticketStage = await stageFactory({
      type: BOARD_TYPES.DEAL,
      pipelineId: ticketPipeline._id
    });
    const ticket = await ticketFactory({
      sourceConversationIds: [conversation._id],
      stageId: ticketStage._id
    });

    let response = await graphqlRequest(qry, 'convertToInfo', {
      conversationId: conversation._id
    });

    expect(response.dealUrl).toBe(
      `/deal/board?_id=${dealBoard._id}&pipelineId=${dealPipeline._id}&itemId=${deal._id}`
    );
    expect(response.taskUrl).toBe(
      `/task/board?_id=${taskBoard._id}&pipelineId=${taskPipeline._id}&itemId=${task._id}`
    );
    expect(response.ticketUrl).toBe(
      `/ticket/board?_id=${ticketBoard._id}&pipelineId=${ticketPipeline._id}&itemId=${ticket._id}`
    );

    response = await graphqlRequest(qry, 'convertToInfo', {
      conversationId: 'fakeId'
    });

    expect(response.dealUrl).toBe('');
    expect(response.ticketUrl).toBe('');
    expect(response.taskUrl).toBe('');
  });

  test('Archived stages', async () => {
    const pipeline = await pipelineFactory();

    const params = {
      pipelineId: pipeline._id,
      status: BOARD_STATUSES.ARCHIVED
    };

    const stage1 = await stageFactory(params);
    await stageFactory(params);
    await stageFactory(params);

    const qry = `
      query archivedStages($pipelineId: String!, $search: String, $page: Int, $perPage: Int) {
        archivedStages(pipelineId: $pipelineId, search: $search, page: $page, perPage: $perPage) {
          _id
        }
      }
    `;

    let response = await graphqlRequest(qry, 'archivedStages', {
      pipelineId: pipeline._id
    });

    expect(response.length).toBe(3);

    response = await graphqlRequest(qry, 'archivedStages', {
      pipelineId: pipeline._id,
      search: stage1.name
    });

    expect(response.length).toBe(1);
  });

  test('Archived stages count ', async () => {
    const pipeline = await pipelineFactory();

    const params = {
      pipelineId: pipeline._id,
      status: BOARD_STATUSES.ARCHIVED,
      name: 'other'
    };

    const stage1 = await stageFactory({ ...params, name: 'stage1' });
    await stageFactory(params);
    await stageFactory(params);

    const qry = `
      query archivedStagesCount($pipelineId: String!, $search: String) {
        archivedStagesCount(pipelineId: $pipelineId, search: $search)
      }
    `;

    let response = await graphqlRequest(qry, 'archivedStagesCount', {
      pipelineId: pipeline._id
    });

    expect(response).toBe(3);

    response = await graphqlRequest(qry, 'archivedStagesCount', {
      pipelineId: pipeline._id,
      search: stage1.name
    });

    expect(response).toBe(1);
  });

  test('itemsCountBySegments', async () => {
    const segment = await segmentFactory({ contentType: 'deal' });
    const stage = await stageFactory({});
    await dealFactory({ stageId: stage._id });

    const mock = sinon.stub(elk, 'fetchElk').callsFake(() => {
      return Promise.resolve({ count: 1 });
    });

    const qry = `
      query itemsCountBySegments($type: String!) {
        itemsCountBySegments(type: $type)
      }
    `;

    const response = await graphqlRequest(qry, 'itemsCountBySegments', {
      type: 'deal',
      pipelineId: stage.pipelineId
    });

    expect(response[segment._id]).toBe(1);

    mock.restore();
  });
});
