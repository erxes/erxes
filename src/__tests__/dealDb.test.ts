import { boardFactory, dealFactory, pipelineFactory, stageFactory, userFactory } from '../db/factories';
import { Boards, Deals, Pipelines, Stages } from '../db/models';
import { IBoardDocument, IPipelineDocument, IStageDocument } from '../db/models/definitions/boards';
import { IDealDocument } from '../db/models/definitions/deals';
import { IUserDocument } from '../db/models/definitions/users';

import './setup.ts';

describe('Test deals model', () => {
  let board: IBoardDocument;
  let pipeline: IPipelineDocument;
  let stage: IStageDocument;
  let deal: IDealDocument;
  let user: IUserDocument;

  beforeEach(async () => {
    // Creating test data
    board = await boardFactory();
    pipeline = await pipelineFactory({ boardId: board._id });
    stage = await stageFactory({ pipelineId: pipeline._id });
    deal = await dealFactory({ stageId: stage._id });
    user = await userFactory({});
  });

  afterEach(async () => {
    // Clearing test data
    await Boards.deleteMany({});
    await Pipelines.deleteMany({});
    await Stages.deleteMany({});
    await Deals.deleteMany({});
  });

  test('Get deal', async () => {
    try {
      await Deals.getDeal('fakeId');
    } catch (e) {
      expect(e.message).toBe('Deal not found');
    }

    const response = await Deals.getDeal(deal._id);

    expect(response).toBeDefined();
  });

  // Test deal
  test('Create deal', async () => {
    const createdDeal = await Deals.createDeal({
      stageId: deal.stageId,
      userId: user._id,
    });

    expect(createdDeal).toBeDefined();
    expect(createdDeal.stageId).toEqual(stage._id);
    expect(createdDeal.createdAt).toEqual(deal.createdAt);
    expect(createdDeal.userId).toEqual(user._id);
  });

  test('Update deal', async () => {
    const dealStageId = 'fakeId';
    const updatedDeal = await Deals.updateDeal(deal._id, {
      stageId: dealStageId,
    });

    expect(updatedDeal).toBeDefined();
    expect(updatedDeal.stageId).toEqual(dealStageId);
    expect(updatedDeal.closeDate).toEqual(deal.closeDate);
  });

  test('Update deal orders', async () => {
    const dealToOrder = await dealFactory({});

    const [updatedDeal, updatedDealToOrder] = await Deals.updateOrder(stage._id, [
      { _id: deal._id, order: 9 },
      { _id: dealToOrder._id, order: 3 },
    ]);

    expect(updatedDeal.stageId).toBe(stage._id);
    expect(updatedDeal.order).toBe(3);
    expect(updatedDealToOrder.order).toBe(9);
  });

  test('Update deal orders when orders length is zero', async () => {
    const response = await Deals.updateOrder(stage._id, []);

    expect(response.length).toBe(0);
  });

  test('Watch deal', async () => {
    await Deals.watchDeal(deal._id, true, user._id);

    const watchedDeal = await Deals.getDeal(deal._id);

    expect(watchedDeal.watchedUserIds).toContain(user._id);

    // testing unwatch
    await Deals.watchDeal(deal._id, false, user._id);

    const unwatchedDeal = await Deals.getDeal(deal._id);

    expect(unwatchedDeal.watchedUserIds).not.toContain(user._id);
  });
});
