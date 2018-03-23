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
import dealMutations from '../data/resolvers/mutations/deals';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Test deals mutations', () => {
  let _board, _pipeline, _pipeline2, _stage, _stage2, _deal, _deal2, _user;

  beforeEach(async () => {
    // Creating test data
    _board = await dealBoardFactory();

    _pipeline = await dealPipelineFactory({ boardId: _board._id });
    _pipeline2 = await dealPipelineFactory();

    _stage = await dealStageFactory({
      pipelineId: _pipeline._id,
      boardId: _board._id,
    });
    _stage2 = await dealPipelineFactory();

    _deal = await dealFactory({
      pipelineId: _pipeline._id,
      boardId: _board._id,
      stageId: _stage._id,
    });
    _deal2 = await dealPipelineFactory();

    _user = await userFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await DealBoards.remove({});
    await DealPipelines.remove({});
    await DealStages.remove({});
    await Deals.remove({});
  });

  test('Check login required', async () => {
    expect.assertions(17);

    const check = async fn => {
      try {
        await fn({}, {}, {});
      } catch (e) {
        expect(e.message).toEqual('Login required');
      }
    };

    // add
    check(dealMutations.dealBoardsAdd);

    // edit
    check(dealMutations.dealBoardsEdit);

    // remove
    check(dealMutations.dealBoardsRemove);

    // add
    check(dealMutations.dealPipelinesAdd);

    // edit
    check(dealMutations.dealPipelinesEdit);

    // update order
    check(dealMutations.dealPipelinesUpdateOrder);

    // remove
    check(dealMutations.dealPipelinesRemove);

    // add
    check(dealMutations.dealStagesAdd);

    // edit
    check(dealMutations.dealStagesEdit);

    // change
    check(dealMutations.dealStagesChange);

    // update order
    check(dealMutations.dealStagesUpdateOrder);

    // remove
    check(dealMutations.dealStagesRemove);

    // add
    check(dealMutations.dealsAdd);

    // edit
    check(dealMutations.dealsEdit);

    // change
    check(dealMutations.dealsChange);

    // update order
    check(dealMutations.dealsUpdateOrder);

    // remove
    check(dealMutations.dealsRemove);
  });

  test('Create board', async () => {
    const boardDoc = { name: 'deal board' };

    DealBoards.createBoard = jest.fn();
    await dealMutations.dealBoardsAdd({}, boardDoc, { user: _user });

    expect(DealBoards.createBoard).toBeCalledWith({
      ...boardDoc,
      userId: _user._id,
    });
    expect(DealBoards.createBoard.mock.calls.length).toBe(1);
  });

  test('Update board', async () => {
    const updateDoc = { name: 'board title' };

    DealBoards.updateBoard = jest.fn();
    await dealMutations.dealBoardsEdit(null, { _id: _board._id, ...updateDoc }, { user: _user });

    expect(DealBoards.updateBoard).toBeCalledWith(_board._id, updateDoc);
    expect(DealBoards.updateBoard.mock.calls.length).toBe(1);
  });

  test('Remove board', async () => {
    DealBoards.removeBoard = jest.fn();
    await dealMutations.dealBoardsRemove({}, { _id: _board.id }, { user: _user });

    expect(DealBoards.removeBoard.mock.calls.length).toBe(1);
  });

  test('Create pipeline', async () => {
    const pipelineDoc = { name: 'deal pipeline', boardId: _board._id };

    DealPipelines.createPipeline = jest.fn();
    await dealMutations.dealPipelinesAdd({}, { stages: [], ...pipelineDoc }, { user: _user });

    expect(DealPipelines.createPipeline).toBeCalledWith(
      {
        ...pipelineDoc,
        userId: _user._id,
      },
      [],
    );
    expect(DealPipelines.createPipeline.mock.calls.length).toBe(1);
  });

  test('Update pipeline', async () => {
    const updateDoc = { name: 'pipeline title', boardId: 'fakeId' };

    DealPipelines.updatePipeline = jest.fn();
    await dealMutations.dealPipelinesEdit(
      null,
      { _id: _pipeline._id, ...updateDoc, stages: [] },
      { user: _user },
    );

    expect(DealPipelines.updatePipeline).toBeCalledWith(_pipeline._id, updateDoc, []);
    expect(DealPipelines.updatePipeline.mock.calls.length).toBe(1);
  });

  test('Pipeline update orders', async () => {
    const orders = [{ _id: _pipeline._id, order: 9 }, { _id: _pipeline2._id, order: 3 }];

    DealPipelines.updateOrder = jest.fn();
    await dealMutations.dealPipelinesUpdateOrder(null, { orders }, { user: _user });

    expect(DealPipelines.updateOrder).toBeCalledWith(orders);
    expect(DealPipelines.updateOrder.mock.calls.length).toBe(1);
  });

  test('Remove pipeline', async () => {
    DealPipelines.removePipeline = jest.fn();
    await dealMutations.dealPipelinesRemove({}, { _id: _pipeline.id }, { user: _user });

    expect(DealPipelines.removePipeline.mock.calls.length).toBe(1);
  });

  test('Create stage', async () => {
    const stageDoc = {
      name: 'deal stage',
      boardId: _board._id,
      pipelineId: _pipeline._id,
    };

    DealStages.createStage = jest.fn();
    await dealMutations.dealStagesAdd({}, stageDoc, { user: _user });

    expect(DealStages.createStage).toBeCalledWith({
      ...stageDoc,
      userId: _user._id,
    });
    expect(DealStages.createStage.mock.calls.length).toBe(1);
  });

  test('Update stage', async () => {
    const updateDoc = { name: 'stage title', boardId: 'fakeId' };

    DealStages.updateStage = jest.fn();
    await dealMutations.dealStagesEdit(null, { _id: _stage._id, ...updateDoc }, { user: _user });

    expect(DealStages.updateStage).toBeCalledWith(_stage._id, updateDoc);
    expect(DealStages.updateStage.mock.calls.length).toBe(1);
  });

  test('Change stage', async () => {
    const pipelineId = _pipeline._id;
    DealStages.changeStage = jest.fn();
    await dealMutations.dealStagesChange(null, { _id: _stage._id, pipelineId }, { user: _user });

    expect(DealStages.changeStage).toBeCalledWith(_stage._id, pipelineId);
    expect(DealStages.changeStage.mock.calls.length).toBe(1);
  });

  test('Stage update orders', async () => {
    const orders = [{ _id: _stage._id, order: 9 }, { _id: _stage2._id, order: 3 }];

    DealStages.updateOrder = jest.fn();
    await dealMutations.dealStagesUpdateOrder(null, { orders }, { user: _user });

    expect(DealStages.updateOrder).toBeCalledWith(orders);
    expect(DealStages.updateOrder.mock.calls.length).toBe(1);
  });

  test('Remove stage', async () => {
    DealStages.removeStage = jest.fn();
    await dealMutations.dealStagesRemove({}, { _id: _stage.id }, { user: _user });

    expect(DealStages.removeStage.mock.calls.length).toBe(1);
  });

  test('Create deal', async () => {
    const dealDoc = {
      boardId: _deal.boardId,
      pipelineId: _deal.pipelineId,
      stageId: _deal.stageId,
      productIds: _deal.productIds,
      companyId: _deal.companyId,
      amount: _deal.amount,
      closeDate: _deal.closeDate,
      note: _deal.note,
      assignedUserIds: _deal.assignedUserIds,
    };

    Deals.createDeal = jest.fn();
    await dealMutations.dealsAdd({}, dealDoc, { user: _user });

    expect(Deals.createDeal).toBeCalledWith({
      ...dealDoc,
      userId: _user._id,
    });
    expect(Deals.createDeal.mock.calls.length).toBe(1);
  });

  test('Update deal', async () => {
    const updateDoc = { boardId: 'fakeId' };

    Deals.updateDeal = jest.fn();
    await dealMutations.dealsEdit(null, { _id: _deal._id, ...updateDoc }, { user: _user });

    expect(Deals.updateDeal).toBeCalledWith(_deal._id, updateDoc);
    expect(Deals.updateDeal.mock.calls.length).toBe(1);
  });

  test('Change deal', async () => {
    const updateDoc = { stageId: _stage._id };
    Deals.updateDeal = jest.fn();
    await dealMutations.dealsChange(null, { _id: _deal._id, ...updateDoc }, { user: _user });

    expect(Deals.updateDeal).toBeCalledWith(_deal._id, updateDoc);
    expect(Deals.updateDeal.mock.calls.length).toBe(1);
  });

  test('Deal update orders', async () => {
    const orders = [{ _id: _deal._id, order: 9 }, { _id: _deal2._id, order: 3 }];

    Deals.updateOrder = jest.fn();
    await dealMutations.dealsUpdateOrder(null, { orders }, { user: _user });

    expect(Deals.updateOrder).toBeCalledWith(orders);
    expect(Deals.updateOrder.mock.calls.length).toBe(1);
  });

  test('Remove deal', async () => {
    Deals.removeDeal = jest.fn();
    await dealMutations.dealsRemove({}, { _id: _deal.id }, { user: _user });

    expect(Deals.removeDeal.mock.calls.length).toBe(1);
  });
});
