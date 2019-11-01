import { boardFactory, growthHackFactory, pipelineFactory, stageFactory, userFactory } from '../db/factories';
import { Boards, GrowthHacks, Pipelines, Stages } from '../db/models';
import { IBoardDocument, IPipelineDocument, IStageDocument } from '../db/models/definitions/boards';
import { IGrowthHackDocument } from '../db/models/definitions/growthHacks';
import { IUserDocument } from '../db/models/definitions/users';

import { BOARD_TYPES } from '../db/models/definitions/constants';
import './setup.ts';

describe('Test growthHacks model', () => {
  let board: IBoardDocument;
  let pipeline: IPipelineDocument;
  let stage: IStageDocument;
  let growthHack: IGrowthHackDocument;
  let user: IUserDocument;

  beforeEach(async () => {
    // Creating test data
    board = await boardFactory({ type: BOARD_TYPES.GROWTH_HACK });
    pipeline = await pipelineFactory({ boardId: board._id });
    stage = await stageFactory({ pipelineId: pipeline._id });
    growthHack = await growthHackFactory({ stageId: stage._id });
    user = await userFactory({});
  });

  afterEach(async () => {
    // Clearing test data
    await Boards.deleteMany({});
    await Pipelines.deleteMany({});
    await Stages.deleteMany({});
    await GrowthHacks.deleteMany({});
  });

  // Test growthHack
  test('Create growthHack', async () => {
    const createdGrowthHack = await GrowthHacks.createGrowthHack({
      stageId: growthHack.stageId,
      userId: user._id,
    });

    expect(createdGrowthHack).toBeDefined();
    expect(createdGrowthHack.stageId).toEqual(stage._id);
    expect(createdGrowthHack.createdAt).toEqual(growthHack.createdAt);
    expect(createdGrowthHack.userId).toEqual(user._id);
  });

  test('Update growthHack', async () => {
    const growthHackStageId = 'fakeId';
    const updatedGrowthHack = await GrowthHacks.updateGrowthHack(growthHack._id, {
      stageId: growthHackStageId,
    });

    expect(updatedGrowthHack).toBeDefined();
    expect(updatedGrowthHack.stageId).toEqual(growthHackStageId);
    expect(updatedGrowthHack.closeDate).toEqual(growthHack.closeDate);
  });

  test('Update growthHack orders', async () => {
    const growthHackToOrder = await growthHackFactory({});

    const [updatedGrowthHack, updatedGrowthHackToOrder] = await GrowthHacks.updateOrder(stage._id, [
      { _id: growthHack._id, order: 9 },
      { _id: growthHackToOrder._id, order: 3 },
    ]);

    expect(updatedGrowthHack.stageId).toBe(stage._id);
    expect(updatedGrowthHack.order).toBe(3);
    expect(updatedGrowthHackToOrder.order).toBe(9);
  });
});
