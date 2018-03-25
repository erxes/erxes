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
  let board, pipeline, stage, deal, user;

  beforeEach(async () => {
    // Creating test data
    board = await dealBoardFactory();

    pipeline = await dealPipelineFactory({ boardId: board._id });

    stage = await dealStageFactory({ pipelineId: pipeline._id });

    deal = await dealFactory({ stageId: stage._id });

    user = await userFactory();
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

    await dealMutations.dealBoardsAdd({}, boardDoc, { user });

    expect(DealBoards.createBoard).toBeCalledWith({
      ...boardDoc,
      userId: user._id,
    });
    expect(DealBoards.createBoard.mock.calls.length).toBe(1);
  });

  test('Update board', async () => {
    const updateDoc = { name: 'board title' };

    DealBoards.updateBoard = jest.fn();

    await dealMutations.dealBoardsEdit(null, { _id: board._id, ...updateDoc }, { user });

    expect(DealBoards.updateBoard).toBeCalledWith(board._id, updateDoc);
    expect(DealBoards.updateBoard.mock.calls.length).toBe(1);
  });

  test('Remove board', async () => {
    DealBoards.removeBoard = jest.fn();

    await dealMutations.dealBoardsRemove({}, { _id: board.id }, { user });

    expect(DealBoards.removeBoard.mock.calls.length).toBe(1);
  });

  test('Create pipeline', async () => {
    const pipelineDoc = { name: 'deal pipeline', boardId: board._id };

    DealPipelines.createPipeline = jest.fn();

    await dealMutations.dealPipelinesAdd({}, { stages: [], ...pipelineDoc }, { user });

    expect(DealPipelines.createPipeline).toBeCalledWith(
      {
        ...pipelineDoc,
        userId: user._id,
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
      { _id: pipeline._id, ...updateDoc, stages: [] },
      { user },
    );

    expect(DealPipelines.updatePipeline).toBeCalledWith(pipeline._id, updateDoc, []);
    expect(DealPipelines.updatePipeline.mock.calls.length).toBe(1);
  });

  test('Pipeline update orders', async () => {
    const pipelineToUpdate = await dealPipelineFactory();

    const orders = [{ _id: pipeline._id, order: 9 }, { _id: pipelineToUpdate._id, order: 3 }];

    DealPipelines.updateOrder = jest.fn();

    await dealMutations.dealPipelinesUpdateOrder(null, { orders }, { user });

    expect(DealPipelines.updateOrder).toBeCalledWith(orders);
    expect(DealPipelines.updateOrder.mock.calls.length).toBe(1);
  });

  test('Remove pipeline', async () => {
    DealPipelines.removePipeline = jest.fn();

    await dealMutations.dealPipelinesRemove({}, { _id: pipeline.id }, { user });

    expect(DealPipelines.removePipeline.mock.calls.length).toBe(1);
  });

  test('Create stage', async () => {
    const stageDoc = {
      name: 'deal stage',
      pipelineId: pipeline._id,
    };

    DealStages.createStage = jest.fn();

    await dealMutations.dealStagesAdd({}, stageDoc, { user });

    expect(DealStages.createStage).toBeCalledWith({
      ...stageDoc,
      userId: user._id,
    });
    expect(DealStages.createStage.mock.calls.length).toBe(1);
  });

  test('Update stage', async () => {
    const updateDoc = { name: 'stage title', boardId: 'fakeId' };

    DealStages.updateStage = jest.fn();

    await dealMutations.dealStagesEdit(null, { _id: stage._id, ...updateDoc }, { user });

    expect(DealStages.updateStage).toBeCalledWith(stage._id, updateDoc);
    expect(DealStages.updateStage.mock.calls.length).toBe(1);
  });

  test('Change stage', async () => {
    DealStages.changeStage = jest.fn();

    await dealMutations.dealStagesChange(
      null,
      { _id: stage._id, pipelineId: pipeline._id },
      { user },
    );

    expect(DealStages.changeStage).toBeCalledWith(stage._id, pipeline._id);
    expect(DealStages.changeStage.mock.calls.length).toBe(1);
  });

  test('Stage update orders', async () => {
    const stageToUpdate = await dealPipelineFactory();

    const orders = [{ _id: stage._id, order: 9 }, { _id: stageToUpdate._id, order: 3 }];

    DealStages.updateOrder = jest.fn();

    await dealMutations.dealStagesUpdateOrder(null, { orders }, { user });

    expect(DealStages.updateOrder).toBeCalledWith(orders);
    expect(DealStages.updateOrder.mock.calls.length).toBe(1);
  });

  test('Remove stage', async () => {
    DealStages.removeStage = jest.fn();

    await dealMutations.dealStagesRemove({}, { _id: stage.id }, { user });

    expect(DealStages.removeStage.mock.calls.length).toBe(1);
  });

  test('Create deal', async () => {
    const dealDoc = {
      stageId: deal.stageId,
      companyId: deal.companyId,
      amount: deal.amount,
      closeDate: deal.closeDate,
      note: deal.note,
      assignedUserIds: deal.assignedUserIds,
    };

    Deals.createDeal = jest.fn();

    await dealMutations.dealsAdd({}, dealDoc, { user });

    expect(Deals.createDeal).toBeCalledWith({
      ...dealDoc,
      userId: user._id,
    });
    expect(Deals.createDeal.mock.calls.length).toBe(1);
  });

  test('Update deal', async () => {
    const updateDoc = { boardId: 'fakeId' };

    Deals.updateDeal = jest.fn();

    await dealMutations.dealsEdit(null, { _id: deal._id, ...updateDoc }, { user });

    expect(Deals.updateDeal).toBeCalledWith(deal._id, updateDoc);
    expect(Deals.updateDeal.mock.calls.length).toBe(1);
  });

  test('Change deal', async () => {
    const updateDoc = { stageId: stage._id };

    Deals.updateDeal = jest.fn();

    await dealMutations.dealsChange(null, { _id: deal._id, ...updateDoc }, { user });

    expect(Deals.updateDeal).toBeCalledWith(deal._id, updateDoc);
    expect(Deals.updateDeal.mock.calls.length).toBe(1);
  });

  test('Deal update orders', async () => {
    const dealToUpdate = await dealPipelineFactory();

    const orders = [{ _id: deal._id, order: 9 }, { _id: dealToUpdate._id, order: 3 }];

    Deals.updateOrder = jest.fn();

    await dealMutations.dealsUpdateOrder(null, { orders }, { user });

    expect(Deals.updateOrder).toBeCalledWith(orders);
    expect(Deals.updateOrder.mock.calls.length).toBe(1);
  });

  test('Remove deal', async () => {
    Deals.removeDeal = jest.fn();

    await dealMutations.dealsRemove({}, { _id: deal.id }, { user });

    expect(Deals.removeDeal.mock.calls.length).toBe(1);
  });
});
