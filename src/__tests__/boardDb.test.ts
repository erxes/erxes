import { boardFactory, dealFactory, pipelineFactory, stageFactory, userFactory } from '../db/factories';
import { Boards, Deals, Pipelines, Stages } from '../db/models';
import { IBoardDocument, IPipelineDocument, IStageDocument } from '../db/models/definitions/boards';
import { IUserDocument } from '../db/models/definitions/users';

import './setup.ts';

describe('Test board model', () => {
  let board: IBoardDocument;
  let pipeline: IPipelineDocument;
  let stage: IStageDocument;
  let user: IUserDocument;

  beforeEach(async () => {
    // Creating test data
    board = await boardFactory();
    pipeline = await pipelineFactory({ boardId: board._id });
    stage = await stageFactory({ pipelineId: pipeline._id });
    await dealFactory({ stageId: stage._id });
    user = await userFactory({});
  });

  afterEach(async () => {
    // Clearing test data
    await Boards.deleteMany({});
    await Pipelines.deleteMany({});
    await Stages.deleteMany({});
    await Deals.deleteMany({});
  });

  // Test deal board
  test('Create board', async () => {
    const createdBoard = await Boards.createBoard({
      name: board.name,
      userId: user._id,
      type: 'deal',
    });

    expect(createdBoard).toBeDefined();
    expect(createdBoard.name).toEqual(board.name);
    expect(createdBoard.type).toEqual(board.type);
    expect(createdBoard.createdAt).toEqual(board.createdAt);
    expect(createdBoard.userId).toEqual(user._id);
  });

  test('Update board', async () => {
    const boardName = 'Update board name';
    const updatedBoard = await Boards.updateBoard(board._id, {
      name: boardName,
      userId: user._id,
      type: 'deal',
    });

    expect(updatedBoard).toBeDefined();
    expect(updatedBoard.name).toEqual(boardName);
    expect(updatedBoard.userId).toEqual(user._id);
  });

  test('Remove board', async () => {
    const doc = { boardId: 'boardId' };

    await Pipelines.updateMany({}, { $set: doc });

    const isDeleted = await Boards.removeBoard(board.id);

    expect(isDeleted).toBeTruthy();
  });

  test('Remove board not found', async () => {
    expect.assertions(1);

    const fakeBoardId = 'fakeBoardId';

    try {
      await Boards.removeBoard(fakeBoardId);
    } catch (e) {
      expect(e.message).toEqual('Board not found');
    }
  });

  test("Can't remove a board", async () => {
    expect.assertions(1);

    try {
      await Boards.removeBoard(board._id);
    } catch (e) {
      expect(e.message).toEqual("Can't remove a board");
    }
  });

  // Test deal pipeline
  test('Create pipeline', async () => {
    const createdPipeline = await Pipelines.createPipeline(
      {
        name: pipeline.name,
        boardId: pipeline.boardId,
        userId: user._id,
        type: pipeline.type,
        bgColor: pipeline.bgColor,
      },
      [stage.toJSON()],
    );

    const stageToPipeline = await Stages.findOne({ _id: stage._id });

    if (!stageToPipeline) {
      throw new Error('Stage not found');
    }

    expect(createdPipeline).toBeDefined();
    expect(createdPipeline._id).toEqual(stageToPipeline.pipelineId);
    expect(createdPipeline.name).toEqual(pipeline.name);
    expect(createdPipeline.type).toEqual(pipeline.type);
    expect(createdPipeline.bgColor).toEqual(pipeline.bgColor);
    expect(createdPipeline.boardId).toEqual(board._id);
    expect(createdPipeline.createdAt).toEqual(pipeline.createdAt);
    expect(createdPipeline.userId).toEqual(user._id);
  });

  test('Update pipeline', async () => {
    const args = {
      name: 'deal pipeline',
      type: 'deal',
      boardId: board._id,
      stages: [stage.toJSON()],
      visibility: 'public',
      bgColor: 'bbb',
    };

    const pipelineObj = await pipelineFactory({});

    const stageObj = await stageFactory({ pipelineId: pipelineObj._id });
    const testStage = await stageFactory({ pipelineId: pipelineObj._id });

    const updatedPipeline = await Pipelines.updatePipeline(pipelineObj._id, args, [stageObj.toJSON()]);

    expect(updatedPipeline).toBeDefined();
    expect(updatedPipeline._id).toEqual(pipelineObj._id);
    expect(updatedPipeline.name).toEqual(args.name);
    expect(updatedPipeline.type).toEqual(args.type);
    expect(updatedPipeline.visibility).toEqual(args.visibility);
    expect(updatedPipeline.boardId).toEqual(board._id);
    expect(updatedPipeline.bgColor).toEqual(args.bgColor);

    const stages = await Stages.find({ _id: testStage._id });
    expect(stages.length).toEqual(0);
  });

  test('Update pipeline orders', async () => {
    const pipelineToOrder = await pipelineFactory({});

    const [updatedPipeline, updatedPipelineToOrder] = await Pipelines.updateOrder([
      { _id: pipeline._id, order: 5 },
      { _id: pipelineToOrder._id, order: 4 },
    ]);

    expect(updatedPipeline.order).toBe(4);
    expect(updatedPipelineToOrder.order).toBe(5);
  });

  test('Remove pipeline', async () => {
    const doc = { pipelineId: 'pipelineId' };

    await Stages.updateMany({}, { $set: doc });

    const isDeleted = await Pipelines.removePipeline(pipeline.id);
    expect(isDeleted).toBeTruthy();
  });

  test('Remove pipeline not found', async () => {
    expect.assertions(1);

    const fakePipelineId = 'fakePipelineId';

    try {
      await Pipelines.removePipeline(fakePipelineId);
    } catch (e) {
      expect(e.message).toEqual('Pipeline not found');
    }
  });

  test("Can't remove a pipeline", async () => {
    expect.assertions(1);

    try {
      await Pipelines.removePipeline(pipeline._id);
    } catch (e) {
      expect(e.message).toEqual("Can't remove a pipeline");
    }
  });

  // Test deal stage
  test('Create stage', async () => {
    const createdStage = await Stages.createStage({
      name: stage.name,
      pipelineId: stage.pipelineId,
      userId: user._id,
      type: 'deal',
    });

    expect(createdStage).toBeDefined();
    expect(createdStage.name).toEqual(stage.name);
    expect(createdStage.type).toEqual(stage.type);
    expect(createdStage.pipelineId).toEqual(pipeline._id);
    expect(createdStage.createdAt).toEqual(stage.createdAt);
    expect(createdStage.userId).toEqual(user._id);
  });

  test('Update stage', async () => {
    const stageName = 'Update stage name';
    const updatedStage = await Stages.updateStage(stage._id, {
      name: stageName,
      userId: user._id,
      type: 'deal',
    });

    expect(updatedStage).toBeDefined();
    expect(updatedStage.name).toEqual(stageName);
  });

  test('Update stage orders', async () => {
    const stageToOrder = await stageFactory({});

    const [updatedStage, updatedStageToOrder] = await Stages.updateOrder([
      { _id: stage._id, order: 9 },
      { _id: stageToOrder._id, order: 5 },
    ]);

    expect(updatedStage.order).toBe(5);
    expect(updatedStageToOrder.order).toBe(9);
  });
});
