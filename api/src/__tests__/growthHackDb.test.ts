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

  test('Get growth hack', async () => {
    try {
      await GrowthHacks.getGrowthHack('fakeId');
    } catch (e) {
      expect(e.message).toBe('Growth hack not found');
    }

    const response = await GrowthHacks.getGrowthHack(growthHack._id);

    expect(response).toBeDefined();
  });

  // Test growthHack
  test('Create growthHack', async () => {
    const createdGrowthHack = await GrowthHacks.createGrowthHack({
      stageId: growthHack.stageId,
      userId: user._id,
    });

    expect(createdGrowthHack).toBeDefined();
    expect(createdGrowthHack.stageId).toEqual(stage._id);
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

  test('Watch growthHack', async () => {
    await GrowthHacks.watchGrowthHack(growthHack._id, true, user._id);

    const watchedGH = await GrowthHacks.getGrowthHack(growthHack._id);

    expect(watchedGH.watchedUserIds).toContain(user._id);

    // testing unwatch
    await GrowthHacks.watchGrowthHack(growthHack._id, false, user._id);

    const unwatchedGH = await GrowthHacks.getGrowthHack(growthHack._id);

    expect(unwatchedGH.watchedUserIds).not.toContain(user._id);
  });

  test('Vote growthHack', async () => {
    await GrowthHacks.voteGrowthHack(growthHack._id, true, user._id);

    const voteGH = await GrowthHacks.getGrowthHack(growthHack._id);

    expect(voteGH.votedUserIds).toContain(user._id);
    expect(voteGH.voteCount).toBe(1);

    // testing unwatch
    await GrowthHacks.voteGrowthHack(growthHack._id, false, user._id);

    const unvoteGH = await GrowthHacks.getGrowthHack(growthHack._id);

    expect(unvoteGH.watchedUserIds).not.toContain(user._id);
    expect(unvoteGH.voteCount).toBe(0);
  });
});
