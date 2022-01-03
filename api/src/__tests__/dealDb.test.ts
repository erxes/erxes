import {
  boardFactory,
  conversationFactory,
  dealFactory,
  pipelineFactory,
  pipelineLabelFactory,
  stageFactory,
  userFactory
} from '../db/factories';
import { Boards, Deals, Pipelines, Stages } from '../db/models';
import { getItem } from '../db/models/boardUtils';
import {
  IBoardDocument,
  IPipelineDocument,
  IStageDocument
} from '../db/models/definitions/boards';
import { IDealDocument } from '../db/models/definitions/deals';
import { IPipelineLabelDocument } from '../db/models/definitions/pipelineLabels';
import { IUserDocument } from '../db/models/definitions/users';

import './setup.ts';

describe('Test deals model', () => {
  let board: IBoardDocument;
  let pipeline: IPipelineDocument;
  let stage: IStageDocument;
  let deal: IDealDocument;
  let user: IUserDocument;
  let label: IPipelineLabelDocument;
  let secondUser: IUserDocument;

  beforeEach(async () => {
    // Creating test data
    board = await boardFactory();
    pipeline = await pipelineFactory({ boardId: board._id });
    stage = await stageFactory({ pipelineId: pipeline._id });
    user = await userFactory({});
    secondUser = await userFactory({});
    label = await pipelineLabelFactory({});
    deal = await dealFactory({
      initialStageId: stage._id,
      stageId: stage._id,
      userId: user._id,
      modifiedBy: user._id,
      labelIds: [label._id],
      assignedUserIds: [user._id],
      watchedUserIds: [secondUser._id]
    });
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

  test('Get item on deal', async () => {
    try {
      await getItem('deal', { _id: 'fakeId' });
    } catch (e) {
      expect(e.message).toBe('deal not found');
    }

    const response = await getItem('deal', { _id: deal._id });

    expect(response).toBeDefined();
  });

  test('Create deal', async () => {
    const args = {
      stageId: deal.stageId,
      userId: user._id
    };

    const createdDeal = await Deals.createDeal(args);

    expect(createdDeal).toBeDefined();
    expect(createdDeal.stageId).toEqual(stage._id);
    expect(createdDeal.userId).toEqual(user._id);
  });

  test('Create deals and check number is not duplicated', async () => {
    const args = {
      type: 'deal',
      boardId: board._id,
      numberConfig: '{year}__',
      numberSize: '1'
    };

    const createdPipeline = await Pipelines.createPipeline(args);
    const createdStage = await stageFactory({
      pipelineId: createdPipeline._id
    });

    const requests = [
      Deals.createDeal({ stageId: createdStage._id }),
      Deals.createDeal({ stageId: createdStage._id })
    ];

    await Promise.all(requests.map(req => req));

    const deals = await Deals.find({ stageId: createdStage._id });

    expect(deals.length).toEqual(2);
    expect(deals[0].number).toBe('2021__1');
    expect(deals[1].number).toBe('2021__2');
  });

  test('Create deal Error(`Already converted a deal`)', async () => {
    const conversation = await conversationFactory();

    const args = {
      stageId: deal.stageId,
      userId: user._id,
      sourceConversationIds: [conversation._id]
    };

    const createdDeal = await Deals.createDeal(args);

    expect(createdDeal).toBeDefined();

    // Already converted a deal
    try {
      await Deals.createDeal(args);
    } catch (e) {
      expect(e.message).toBe('Already converted a deal');
    }
  });

  test('Update deal', async () => {
    const dealStageId = 'fakeId';
    const updatedDeal = await Deals.updateDeal(deal._id, {
      stageId: dealStageId
    });

    expect(updatedDeal).toBeDefined();
    expect(updatedDeal.stageId).toEqual(dealStageId);
    expect(updatedDeal.closeDate).toEqual(deal.closeDate);
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

  test('Test removeDeals()', async () => {
    await Deals.removeDeals([deal._id]);

    const removed = await Deals.findOne({ _id: deal._id });

    expect(removed).toBe(null);
  });
});
