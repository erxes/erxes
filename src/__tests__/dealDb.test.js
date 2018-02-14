/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { DealBoards, DealPipelines, DealStages, Deals } from '../db/models';
import {
  dealBoardFactory,
  dealPipelineFactory,
  dealStageFactory,
  dealFactory,
  userFactory,
} from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Test deals model', () => {
  let _board, _pipeline, _stage, _deal, _user;

  beforeEach(async () => {
    // Creating test data
    _board = await dealBoardFactory();
    _pipeline = await dealPipelineFactory({ boardId: _board._id });
    _stage = await dealStageFactory({
      pipelineId: _pipeline._id,
      boardId: _board._id,
    });
    _deal = await dealFactory({
      pipelineId: _pipeline._id,
      boardId: _board._id,
      stageId: _stage._id,
    });
    _user = await userFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await DealBoards.remove({});
    await DealPipelines.remove({});
    await DealStages.remove({});
    await Deals.remove({});
  });

  // Test deal board
  test('Create board', async () => {
    const boardObj = await DealBoards.createBoard({
      name: _board.name,
      userId: _user._id,
    });

    expect(boardObj).toBeDefined();
    expect(boardObj.name).toEqual(_board.name);
    expect(boardObj.createdAt).toEqual(_board.createdAt);
    expect(boardObj.userId).toEqual(_user._id);
  });

  test('Update board', async () => {
    const boardName = 'Update board name';
    const boardObj = await DealBoards.updateBoard(_board._id, {
      name: boardName,
      userId: _user._id,
    });

    expect(boardObj).toBeDefined();
    expect(boardObj.name).toEqual(boardName);
  });

  test('Remove board', async () => {
    const isDeleted = await DealBoards.removeBoard([_board.id]);
    expect(isDeleted).toBeTruthy();
  });

  test('Remove board not found', async () => {
    expect.assertions(1);
    try {
      await DealBoards.removeBoard([_user._id]);
    } catch (e) {
      expect(e.message).toEqual('Board not found');
    }
  });

  // Test deal pipeline
  test('Create pipeline', async () => {
    const pipelineObj = await DealPipelines.createPipeline(
      {
        name: _pipeline.name,
        boardId: _pipeline.boardId,
        userId: _user._id,
      },
      [
        {
          _id: _stage._id,
          name: _stage.name,
          boardId: _stage.boardId,
        },
      ],
    );

    expect(pipelineObj).toBeDefined();
    expect(pipelineObj.name).toEqual(_pipeline.name);
    expect(pipelineObj.boardId).toEqual(_board._id);
    expect(pipelineObj.createdAt).toEqual(_pipeline.createdAt);
    expect(pipelineObj.userId).toEqual(_user._id);
  });

  test('Update pipeline', async () => {
    const pipelineName = 'Update pipeline name';
    const pipelineObj = await DealPipelines.updatePipeline(
      _pipeline._id,
      {
        name: pipelineName,
        userId: _user._id,
      },
      [
        {
          name: _stage.name,
          boardId: _stage.boardId,
        },
      ],
    );

    expect(pipelineObj).toBeDefined();
    expect(pipelineObj.name).toEqual(pipelineName);
  });

  test('Remove pipeline', async () => {
    const isDeleted = await DealPipelines.removePipeline([_pipeline.id]);
    expect(isDeleted).toBeTruthy();
  });

  test('Remove pipeline not found', async () => {
    expect.assertions(1);
    try {
      await DealPipelines.removePipeline([_user._id]);
    } catch (e) {
      expect(e.message).toEqual('Pipeline not found');
    }
  });

  // Test deal stage
  test('Create stage', async () => {
    const stageObj = await DealStages.createStage({
      name: _stage.name,
      boardId: _stage.boardId,
      pipelineId: _stage.pipelineId,
      userId: _user._id,
    });

    expect(stageObj).toBeDefined();
    expect(stageObj.name).toEqual(_stage.name);
    expect(stageObj.boardId).toEqual(_board._id);
    expect(stageObj.pipelineId).toEqual(_pipeline._id);
    expect(stageObj.createdAt).toEqual(_stage.createdAt);
    expect(stageObj.userId).toEqual(_user._id);
  });

  test('Update stage', async () => {
    const stageName = 'Update stage name';
    const stageObj = await DealStages.updateStage(_stage._id, {
      name: stageName,
      userId: _user._id,
    });

    expect(stageObj).toBeDefined();
    expect(stageObj.name).toEqual(stageName);
  });

  test('Remove stage', async () => {
    const isDeleted = await DealStages.removeStage([_stage.id]);
    expect(isDeleted).toBeTruthy();
  });

  test('Remove stage not found', async () => {
    expect.assertions(1);
    try {
      await DealStages.removeStage([_user._id]);
    } catch (e) {
      expect(e.message).toEqual('Stage not found');
    }
  });

  // Test deal
  test('Create deal', async () => {
    const dealObj = await Deals.createDeal({
      boardId: _deal.boardId,
      pipelineId: _deal.pipelineId,
      stageId: _deal.stageId,
      userId: _user._id,
    });

    expect(dealObj).toBeDefined();
    expect(dealObj.boardId).toEqual(_board._id);
    expect(dealObj.pipelineId).toEqual(_pipeline._id);
    expect(dealObj.stageId).toEqual(_stage._id);
    expect(dealObj.createdAt).toEqual(_deal.createdAt);
    expect(dealObj.userId).toEqual(_user._id);
  });

  test('Update deal', async () => {
    const dealCompanyId = 'fakeId';
    const dealObj = await Deals.updateDeal(_deal._id, {
      companyId: dealCompanyId,
    });

    expect(dealObj).toBeDefined();
    expect(dealObj.companyId).toEqual(dealCompanyId);
    expect(dealObj.amount).toEqual(_deal.amount);
    expect(dealObj.closeDate).toEqual(_deal.closeDate);
    expect(dealObj.note).toEqual(_deal.note);
  });

  test('Remove deal', async () => {
    const isDeleted = await Deals.removeDeal([_deal.id]);
    expect(isDeleted).toBeTruthy();
  });

  test('Remove deal not found', async () => {
    expect.assertions(1);
    try {
      await Deals.removeDeal([_user._id]);
    } catch (e) {
      expect(e.message).toEqual('Deal not found');
    }
  });
});
