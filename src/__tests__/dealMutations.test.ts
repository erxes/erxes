import { graphqlRequest } from '../db/connection';
import { boardFactory, dealFactory, pipelineFactory, stageFactory, userFactory } from '../db/factories';
import { Boards, Deals, Pipelines, Stages } from '../db/models';
import { IBoardDocument, IPipelineDocument, IStageDocument } from '../db/models/definitions/boards';
import { BOARD_TYPES } from '../db/models/definitions/constants';
import { IDealDocument } from '../db/models/definitions/deals';

import './setup.ts';

describe('Test deals mutations', () => {
  let board: IBoardDocument;
  let pipeline: IPipelineDocument;
  let stage: IStageDocument;
  let deal: IDealDocument;
  let context;

  const commonDealParamDefs = `
    $name: String!,
    $stageId: String!
  `;

  const commonDealParams = `
    name: $name
    stageId: $stageId
  `;

  beforeEach(async () => {
    // Creating test data
    board = await boardFactory({ type: BOARD_TYPES.DEAL });
    pipeline = await pipelineFactory({ boardId: board._id });
    stage = await stageFactory({ pipelineId: pipeline._id });
    deal = await dealFactory({ stageId: stage._id });
    context = { user: await userFactory({}) };
  });

  afterEach(async () => {
    // Clearing test data
    await Boards.deleteMany({});
    await Pipelines.deleteMany({});
    await Stages.deleteMany({});
    await Deals.deleteMany({});
  });

  test('Create deal', async () => {
    const args = {
      name: deal.name,
      stageId: stage._id,
    };

    const mutation = `
      mutation dealsAdd(${commonDealParamDefs}) {
        dealsAdd(${commonDealParams}) {
          _id
          name
          stageId
        }
      }
    `;

    const createdDeal = await graphqlRequest(mutation, 'dealsAdd', args, context);

    expect(createdDeal.stageId).toEqual(stage._id);
  });

  test('Update deal', async () => {
    const args = {
      _id: deal._id,
      name: deal.name,
      stageId: stage._id,
    };

    const mutation = `
      mutation dealsEdit($_id: String!, ${commonDealParamDefs}) {
        dealsEdit(_id: $_id, ${commonDealParams}) {
          _id
          name
          stageId
        }
      }
    `;

    const updatedDeal = await graphqlRequest(mutation, 'dealsEdit', args, context);

    expect(updatedDeal.stageId).toEqual(stage._id);
  });

  test('Change deal', async () => {
    const args = {
      _id: deal._id,
      destinationStageId: deal.stageId || '',
    };

    const mutation = `
      mutation dealsChange($_id: String!, $destinationStageId: String) {
        dealsChange(_id: $_id, destinationStageId: $destinationStageId) {
          _id,
          stageId
        }
      }
    `;

    const updatedDeal = await graphqlRequest(mutation, 'dealsChange', args, context);

    expect(updatedDeal._id).toEqual(args._id);
  });

  test('Deal update orders', async () => {
    const dealToStage = await dealFactory({});

    const args = {
      orders: [{ _id: deal._id, order: 9 }, { _id: dealToStage._id, order: 3 }],
      stageId: stage._id,
    };

    const mutation = `
      mutation dealsUpdateOrder($stageId: String!, $orders: [OrderItem]) {
        dealsUpdateOrder(stageId: $stageId, orders: $orders) {
          _id
          stageId
          order
        }
      }
    `;

    const [updatedDeal, updatedDealToOrder] = await graphqlRequest(mutation, 'dealsUpdateOrder', args, context);

    expect(updatedDeal.order).toBe(3);
    expect(updatedDealToOrder.order).toBe(9);
    expect(updatedDeal.stageId).toBe(stage._id);
  });

  test('Remove deal', async () => {
    const mutation = `
      mutation dealsRemove($_id: String!) {
        dealsRemove(_id: $_id) {
          _id
        }
      }
    `;

    await graphqlRequest(mutation, 'dealsRemove', { _id: deal._id }, context);

    expect(await Deals.findOne({ _id: deal._id })).toBe(null);
  });

  test('Watch deal', async () => {
    const mutation = `
      mutation dealsWatch($_id: String!, $isAdd: Boolean!) {
        dealsWatch(_id: $_id, isAdd: $isAdd) {
          _id
          isWatched
        }
      }
    `;

    const watchAddDeal = await graphqlRequest(mutation, 'dealsWatch', { _id: deal._id, isAdd: true }, context);

    expect(watchAddDeal.isWatched).toBe(true);

    const watchRemoveDeal = await graphqlRequest(mutation, 'dealsWatch', { _id: deal._id, isAdd: false }, context);

    expect(watchRemoveDeal.isWatched).toBe(false);
  });
});
