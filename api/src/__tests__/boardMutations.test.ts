import { graphqlRequest } from '../db/connection';
import {
  boardFactory,
  dealFactory,
  fieldGroupFactory,
  pipelineFactory,
  stageFactory,
  taskFactory,
  userFactory
} from '../db/factories';
import {
  Boards,
  Deals,
  FieldsGroups,
  Pipelines,
  Stages,
  Tasks,
  Users
} from '../db/models';
import {
  IBoardDocument,
  IPipelineDocument,
  IStageDocument
} from '../db/models/definitions/boards';

import {
  BOARD_TYPES,
  TIME_TRACK_TYPES
} from '../db/models/definitions/constants';
import './setup.ts';

describe('Test boards mutations', () => {
  let board: IBoardDocument;
  let pipeline: IPipelineDocument;
  let stage: IStageDocument;
  let context;

  const commonPipelineParamDefs = `
    $name: String!,
    $boardId: String!,
    $stages: JSON,
    $type: String!
    $visibility: String!
    $bgColor: String,
    $excludeCheckUserIds: [String],
    $memberIds: [String]
  `;

  const commonPipelineParams = `
    name: $name
    boardId: $boardId
    stages: $stages
    type: $type
    visibility: $visibility
    bgColor: $bgColor,
    excludeCheckUserIds: $excludeCheckUserIds,
    memberIds: $memberIds
  `;

  beforeEach(async () => {
    // Creating test data
    board = await boardFactory();
    pipeline = await pipelineFactory({
      boardId: board._id,
      watchedUserIds: []
    });
    stage = await stageFactory({ pipelineId: pipeline._id });
    context = { user: await userFactory({}) };
  });

  afterEach(async () => {
    // Clearing test data
    await Boards.deleteMany({});
    await Pipelines.deleteMany({});
    await Stages.deleteMany({});
    await Deals.deleteMany({});
    await Users.deleteMany({});
  });

  test('Create board', async () => {
    const args = { name: 'deal board', type: 'deal' };

    const mutation = `
      mutation boardsAdd($name: String!, $type: String!) {
        boardsAdd(name: $name, type: $type) {
          _id
          name
          type
        }
      }
    `;

    const createdBoard = await graphqlRequest(
      mutation,
      'boardsAdd',
      args,
      context
    );

    expect(createdBoard.name).toEqual(args.name);
    expect(createdBoard.type).toEqual(args.type);
  });

  test('Update board', async () => {
    const args = { _id: board._id, name: 'deal board', type: 'deal' };

    const mutation = `
      mutation boardsEdit($_id: String!, $name: String!, $type: String!) {
        boardsEdit(name: $name, _id: $_id, type: $type) {
          _id
          name
          type
        }
      }
    `;

    const response = await graphqlRequest(mutation, 'boardsEdit', args);

    expect(response._id).toBe(args._id);
    expect(response.name).toBe(args.name);
    expect(response.type).toBe(args.type);
  });

  test('Update board (Error: Permission required)', async () => {
    const args = { _id: board._id, name: 'deal board', type: 'deal' };

    const mutation = `
      mutation boardsEdit($_id: String!, $name: String!, $type: String!) {
        boardsEdit(name: $name, _id: $_id, type: $type) {
          _id
          name
          type
        }
      }
    `;

    const user = await userFactory({ isOwner: false });

    try {
      await graphqlRequest(mutation, 'boardsEdit', args, { user });
    } catch (e) {
      expect(e[0].message).toBe('Permission required');
    }
  });

  test('Remove board', async () => {
    // disconnect pipeline connected to board
    await Pipelines.updateMany({}, { $set: { boardId: 'fakeBoardId' } });
    await fieldGroupFactory({ boardIds: [board._id] });

    const mutation = `
      mutation boardsRemove($_id: String!) {
        boardsRemove(_id: $_id)
      }
    `;

    await graphqlRequest(mutation, 'boardsRemove', { _id: board._id }, context);

    expect(await Boards.findOne({ _id: board._id })).toBe(null);
    expect((await FieldsGroups.find({ boardIds: [board._id] })).length).toBe(0);
  });

  test('Create pipeline', async () => {
    const user1 = await userFactory();
    const user2 = await userFactory();

    const args = {
      name: 'deal pipeline',
      type: 'deal',
      boardId: board._id,
      stages: [stage.toJSON()],
      visibility: 'public',
      bgColor: 'aaa',
      excludeCheckUserIds: [user1._id],
      memberIds: [user2._id]
    };

    const mutation = `
      mutation pipelinesAdd(${commonPipelineParamDefs}) {
        pipelinesAdd(${commonPipelineParams}) {
          _id
          name
          type
          boardId
          bgColor
          visibility
          excludeCheckUserIds
          memberIds
        }
      }
    `;

    const createdPipeline = await graphqlRequest(
      mutation,
      'pipelinesAdd',
      args,
      context
    );

    // stage connected to pipeline
    const stageToPipeline = await Stages.findOne({ _id: stage._id });

    if (!stageToPipeline) {
      throw new Error('Stage not found');
    }

    expect(createdPipeline._id).toEqual(stageToPipeline.pipelineId);
    expect(createdPipeline.name).toEqual(args.name);
    expect(createdPipeline.type).toEqual(args.type);
    expect(createdPipeline.visibility).toEqual(args.visibility);
    expect(createdPipeline.boardId).toEqual(board._id);
    expect(createdPipeline.bgColor).toEqual(args.bgColor);
    expect(createdPipeline.excludeCheckUserIds.length).toBe(1);
    expect(createdPipeline.memberIds.length).toBe(1);
  });

  test('Update pipeline', async () => {
    const args = {
      _id: pipeline._id,
      name: 'deal pipeline',
      type: 'deal',
      boardId: board._id,
      stages: [stage.toJSON()],
      visibility: 'public',
      bgColor: 'bbb'
    };

    const mutation = `
      mutation pipelinesEdit($_id: String!, ${commonPipelineParamDefs}) {
        pipelinesEdit(_id: $_id, ${commonPipelineParams}) {
          _id
          name
          type
          boardId
          visibility
          bgColor
        }
      }
    `;

    const updatedPipeline = await graphqlRequest(
      mutation,
      'pipelinesEdit',
      args,
      context
    );

    // stage connected to pipeline
    const stageToPipeline = await Stages.findOne({ _id: stage._id });

    if (!stageToPipeline) {
      throw new Error('Stage not found');
    }

    expect(updatedPipeline._id).toEqual(stageToPipeline.pipelineId);
    expect(updatedPipeline.name).toEqual(args.name);
    expect(updatedPipeline.type).toEqual(args.type);
    expect(updatedPipeline.visibility).toEqual(args.visibility);
    expect(updatedPipeline.boardId).toEqual(board._id);
    expect(updatedPipeline.bgColor).toEqual(args.bgColor);
  });

  test('Pipeline update orders', async () => {
    const pipelineToUpdate = await pipelineFactory({});

    const args = {
      orders: [
        { _id: pipeline._id, order: 9 },
        { _id: pipelineToUpdate._id, order: 3 }
      ]
    };

    const mutation = `
      mutation pipelinesUpdateOrder($orders: [OrderItem]) {
        pipelinesUpdateOrder(orders: $orders) {
          _id
          order
        }
      }
    `;

    const [updatedPipeline, updatedPipelineToOrder] = await graphqlRequest(
      mutation,
      'pipelinesUpdateOrder',
      args,
      context
    );

    expect(updatedPipeline.order).toBe(3);
    expect(updatedPipelineToOrder.order).toBe(9);
  });

  test('Watch pipeline', async () => {
    const mutation = `
      mutation pipelinesWatch($_id: String!, $isAdd: Boolean, $type: String!) {
        pipelinesWatch(_id: $_id, isAdd: $isAdd, type: $type) {
          _id
          isWatched
        }
      }
    `;

    const watchAddPipeline = await graphqlRequest(
      mutation,
      'pipelinesWatch',
      { _id: pipeline._id, isAdd: true, type: 'deal' },
      context
    );

    expect(watchAddPipeline.isWatched).toBe(true);

    const watchRemovePipeline = await graphqlRequest(
      mutation,
      'pipelinesWatch',
      { _id: pipeline._id, isAdd: false, type: 'deal' },
      context
    );

    expect(watchRemovePipeline.isWatched).toBe(false);
  });

  test('Archive pipeline', async () => {
    const mutation = `
    mutation pipelinesArchive($_id: String!) {
      pipelinesArchive(_id: $_id)
    }
  `;

    const user = await userFactory();
    const pipe = await pipelineFactory({ watchedUserIds: [user._id] });
    await fieldGroupFactory({ pipelineIds: [pipe._id] });

    await graphqlRequest(
      mutation,
      'pipelinesArchive',
      { _id: pipe._id, status: 'archived' },
      context
    );
    const response = await Pipelines.findOne({ _id: pipe.id });
    expect(response?.status).toBe('archived');
    await graphqlRequest(
      mutation,
      'pipelinesArchive',
      { _id: pipe._id, status: 'active' },
      context
    );
    const response1 = await Pipelines.findOne({ _id: pipe.id });
    expect(response1?.status).toBe('active');
  });

  test('Duplicate pipeline', async () => {
    const mutation = `
      mutation pipelinesCopied($_id: String!) {
        pipelinesCopied(_id: $_id)
      }
    `;

    const sourcePipeline = await pipelineFactory({});
    const sourceStage1 = await stageFactory({ pipelineId: sourcePipeline._id });
    const sourceStage2 = await stageFactory({ pipelineId: sourcePipeline._id });

    const copiedPipeline = await graphqlRequest(
      mutation,
      'pipelinesCopied',
      { _id: sourcePipeline._id },
      context
    );

    expect(copiedPipeline.name).toBe(`${sourcePipeline.name}-copied`);
    expect(copiedPipeline.status).toBe(sourcePipeline.status);
    expect(copiedPipeline.boardId).toBe(sourcePipeline.boardId);
    expect(copiedPipeline.visibility).toBe(sourcePipeline.visibility);
    expect(copiedPipeline.bgColor).toBe(sourcePipeline.bgColor);
    expect(copiedPipeline.startDate).toBe(sourcePipeline.startDate);
    expect(copiedPipeline.endDate).toBe(sourcePipeline.endDate);
    expect(copiedPipeline.metric).toBe(sourcePipeline.metric);
    expect(copiedPipeline.hackScoringType).toBe(sourcePipeline.hackScoringType);
    expect(copiedPipeline.templateId).toBe(sourcePipeline.templateId);
    expect(copiedPipeline.isCheckUser).toBe(sourcePipeline.isCheckUser);

    const copiedStage1 = await Stages.findOne({
      pipelineId: copiedPipeline._id,
      name: sourceStage1.name
    });
    expect(copiedStage1).not.toBeNull();

    const copiedStage2 = await Stages.findOne({
      pipelineId: copiedPipeline._id,
      name: sourceStage2.name
    });
    expect(copiedStage2).not.toBeNull();
  });

  test('Remove pipeline', async () => {
    // disconnect stages connected to pipeline
    await Stages.updateMany({}, { $set: { pipelineId: 'fakePipelineId' } });

    const mutation = `
      mutation pipelinesRemove($_id: String!) {
        pipelinesRemove(_id: $_id)
      }
    `;

    const user = await userFactory();
    const pipe = await pipelineFactory({ watchedUserIds: [user._id] });
    await fieldGroupFactory({ pipelineIds: [pipe._id] });

    await graphqlRequest(
      mutation,
      'pipelinesRemove',
      { _id: pipe._id },
      context
    );

    expect(await Pipelines.findOne({ _id: pipe._id })).toBe(null);
    expect((await FieldsGroups.find({ pipelineIds: pipe._id })).length).toBe(0);
  });

  test('Stage update orders', async () => {
    const stageToUpdate = await stageFactory({});

    const args = {
      orders: [
        { _id: stage._id, order: 9 },
        { _id: stageToUpdate._id, order: 3 }
      ]
    };

    const mutation = `
      mutation stagesUpdateOrder($orders: [OrderItem]) {
        stagesUpdateOrder(orders: $orders) {
          _id
          order
        }
      }
    `;

    const [updatedStage, updatedStageToOrder] = await graphqlRequest(
      mutation,
      'stagesUpdateOrder',
      args,
      context
    );

    expect(updatedStage.order).toBe(3);
    expect(updatedStageToOrder.order).toBe(9);
  });

  test('Edit stage', async () => {
    const mutation = `
      mutation stagesEdit($_id: String!, $type: String, $name: String) {
        stagesEdit(_id: $_id, type: $type, name: $name) {
          _id
          name
        }
      }
    `;

    const updated = await graphqlRequest(mutation, 'stagesEdit', {
      _id: stage._id,
      type: BOARD_TYPES.DEAL,
      name: 'updated'
    });

    expect(updated.name).toBe('updated');
  });

  test('Remove stage', async () => {
    const mutation = `
      mutation stagesRemove($_id: String!) {
        stagesRemove(_id: $_id)
      }
    `;

    await graphqlRequest(mutation, 'stagesRemove', { _id: stage._id });

    expect(await Stages.findOne({ _id: stage._id })).toBe(null);
  });

  test('Sort items in stages', async () => {
    const mutation = `
      mutation stagesSortItems($stageId: String!, $type: String, $proccessId: String, $sortType: String) {
        stagesSortItems(stageId: $stageId, type: $type, proccessId: $proccessId, sortType: $sortType)
      }
    `;

    // no items in stage
    let response = await graphqlRequest(mutation, 'stagesSortItems', {
      stageId: stage._id,
      type: 'deal',
      processId: Math.random().toString(),
      sortType: 'created-asc'
    });

    expect(response).toEqual(null);

    // 3 items in stage
    const deal = await dealFactory({
      stageId: stage._id
    });
    const deal1 = await dealFactory({
      stageId: stage._id,
      closeDate: new Date('2021-03-01')
    });
    const deal2 = await dealFactory({
      stageId: stage._id,
      closeDate: new Date('2021-02-01')
    });

    response = await graphqlRequest(mutation, 'stagesSortItems', {
      stageId: stage._id,
      type: 'deal',
      processId: Math.random().toString(),
      sortType: 'close-asc'
    });

    expect(response).toEqual('ok');

    const deals = await Deals.find({
      stageId: stage._id,
      status: 'active'
    }).sort({ order: 1 });

    expect(deals[0]._id).toEqual(deal2._id);
    expect(deals[1]._id).toEqual(deal1._id);
    expect(deals[2]._id).toEqual(deal._id);
  });

  test('Board item update time track', async () => {
    const mutation = `
      mutation boardItemUpdateTimeTracking($_id: String!, $type: String!, $status: String!, $timeSpent: Int!, $startDate: String) {
        boardItemUpdateTimeTracking(_id: $_id, type: $type, status: $status, timeSpent: $timeSpent, startDate: $startDate)
      }
    `;

    const task = await taskFactory();

    await graphqlRequest(mutation, 'boardItemUpdateTimeTracking', {
      _id: task._id,
      type: 'task',
      status: TIME_TRACK_TYPES.STARTED,
      timeSpent: 10,
      startDate: new Date().toISOString()
    });

    let updatedTask = await Tasks.findOne({ _id: task._id });

    if (updatedTask && updatedTask.timeTrack) {
      expect(updatedTask.timeTrack.status).toBe(TIME_TRACK_TYPES.STARTED);
      expect(updatedTask.timeTrack.timeSpent).toBe(10);
    }

    await graphqlRequest(mutation, 'boardItemUpdateTimeTracking', {
      _id: task._id,
      type: 'task',
      status: TIME_TRACK_TYPES.STOPPED,
      timeSpent: 20
    });

    updatedTask = await Tasks.findOne({ _id: task._id });

    if (updatedTask && updatedTask.timeTrack) {
      expect(updatedTask.timeTrack.status).toBe(TIME_TRACK_TYPES.STOPPED);
      expect(updatedTask.timeTrack.timeSpent).toBe(20);
    }
  });
});
