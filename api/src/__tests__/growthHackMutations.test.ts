import { graphqlRequest } from '../db/connection';
import {
  boardFactory,
  checklistFactory,
  checklistItemFactory,
  growthHackFactory,
  pipelineFactory,
  pipelineLabelFactory,
  stageFactory,
  userFactory,
} from '../db/factories';
import { Boards, ChecklistItems, Checklists, GrowthHacks, PipelineLabels, Pipelines, Stages } from '../db/models';
import { IBoardDocument, IPipelineDocument, IStageDocument } from '../db/models/definitions/boards';
import { BOARD_STATUSES, BOARD_TYPES } from '../db/models/definitions/constants';
import { IGrowthHackDocument } from '../db/models/definitions/growthHacks';
import { IPipelineLabelDocument } from '../db/models/definitions/pipelineLabels';

import './setup.ts';

describe('Test growthHacks mutations', () => {
  let board: IBoardDocument;
  let pipeline: IPipelineDocument;
  let stage: IStageDocument;
  let growthHack: IGrowthHackDocument;
  let label: IPipelineLabelDocument;
  let context;

  const commonGrowthHackParamDefs = `
    $name: String!,
    $stageId: String!
    $hackStages: [String]
    $assignedUserIds: [String]
    $status: String
  `;

  const commonGrowthHackParams = `
    name: $name
    stageId: $stageId
    hackStages: $hackStages
    assignedUserIds: $assignedUserIds
    status: $status
  `;

  const commonDragParamDefs = `
    $itemId: String!,
    $aboveItemId: String,
    $destinationStageId: String!,
    $sourceStageId: String,
    $proccessId: String
  `;

  const commonDragParams = `
    itemId: $itemId,
    aboveItemId: $aboveItemId,
    destinationStageId: $destinationStageId,
    sourceStageId: $sourceStageId,
    proccessId: $proccessId
  `;

  beforeEach(async () => {
    // Creating test data
    board = await boardFactory({ type: BOARD_TYPES.GROWTH_HACK });
    pipeline = await pipelineFactory({ boardId: board._id });
    stage = await stageFactory({ pipelineId: pipeline._id });
    label = await pipelineLabelFactory();
    growthHack = await growthHackFactory({
      initialStageId: stage._id,
      stageId: stage._id,
      labelIds: [label._id],
    });
    context = { user: await userFactory({}) };
  });

  afterEach(async () => {
    // Clearing test data
    await Boards.deleteMany({});
    await Pipelines.deleteMany({});
    await Stages.deleteMany({});
    await GrowthHacks.deleteMany({});
    await PipelineLabels.deleteMany({});
  });

  test('Create growthHack', async () => {
    const args = {
      name: growthHack.name,
      stageId: stage._id,
      hackStages: ['one', 'two'],
    };

    const mutation = `
      mutation growthHacksAdd(${commonGrowthHackParamDefs}) {
        growthHacksAdd(${commonGrowthHackParams}) {
          _id
          name
          stageId
          hackStages
        }
      }
    `;

    const createdGrowthHack = await graphqlRequest(mutation, 'growthHacksAdd', args, context);

    expect(createdGrowthHack.stageId).toEqual(stage._id);
    expect(createdGrowthHack.hackStages[0]).toEqual(args.hackStages[0]);
    expect(createdGrowthHack.hackStages[1]).toEqual(args.hackStages[1]);
  });

  test('Update growthHack', async () => {
    const stage2 = await stageFactory();

    let args: any = {
      _id: growthHack._id,
      name: 'changed-name',
      stageId: stage2._id,
      status: 'archived',
    };

    const mutation = `
      mutation growthHacksEdit($_id: String!, ${commonGrowthHackParamDefs}) {
        growthHacksEdit(_id: $_id, ${commonGrowthHackParams}) {
          _id
          name
          stageId
          assignedUserIds
        }
      }
    `;

    let updatedGrowthHack = await graphqlRequest(mutation, 'growthHacksEdit', args, context);

    expect(updatedGrowthHack.name).toEqual(args.name);
    expect(updatedGrowthHack.stageId).toEqual(args.stageId);

    args.assignedUserIds = [(await userFactory())._id];
    updatedGrowthHack = await graphqlRequest(mutation, 'growthHacksEdit', args, context);

    expect(updatedGrowthHack.assignedUserIds.length).toBe(args.assignedUserIds.length);

    args = {
      _id: growthHack._id,
      name: 'changed-name',
      stageId: stage2._id,
      status: 'active',
    };

    updatedGrowthHack = await graphqlRequest(mutation, 'growthHacksEdit', args, context);
    expect(updatedGrowthHack.stageId).toBe(args.stageId);
  });

  test('Change growthHack', async () => {
    const args = {
      proccessId: Math.random().toString(),
      itemId: growthHack._id,
      aboveItemId: '',
      destinationStageId: growthHack.stageId,
      sourceStageId: growthHack.stageId,
    };

    const mutation = `
      mutation growthHacksChange(${commonDragParamDefs}) {
        growthHacksChange(${commonDragParams}) {
          _id
          name
          stageId
          order
        }
      }
    `;

    const updatedGrowthHack = await graphqlRequest(mutation, 'growthHacksChange', args, context);

    expect(updatedGrowthHack._id).toEqual(args.itemId);
  });

  test('Change growthHack if move to another stage', async () => {
    const anotherStage = await stageFactory({ pipelineId: pipeline._id });

    const args = {
      proccessId: Math.random().toString(),
      itemId: growthHack._id,
      aboveItemId: '',
      destinationStageId: anotherStage._id,
      sourceStageId: growthHack.stageId,
    };

    const mutation = `
      mutation growthHacksChange(${commonDragParamDefs}) {
        growthHacksChange(${commonDragParams}) {
          _id
          name
          stageId
          order
        }
      }
    `;

    const updatedGH = await graphqlRequest(mutation, 'growthHacksChange', args);

    expect(updatedGH._id).toEqual(args.itemId);
  });

  test('Update growthHack move to pipeline stage', async () => {
    const mutation = `
      mutation growthHacksEdit($_id: String!, ${commonGrowthHackParamDefs}) {
        growthHacksEdit(_id: $_id, ${commonGrowthHackParams}) {
          _id
          name
          stageId
          assignedUserIds
        }
      }
    `;

    const anotherPipeline = await pipelineFactory({ boardId: board._id });
    const anotherStage = await stageFactory({ pipelineId: anotherPipeline._id });

    const args = {
      _id: growthHack._id,
      stageId: anotherStage._id,
      name: growthHack.name || '',
    };

    const updatedGrowthHack = await graphqlRequest(mutation, 'growthHacksEdit', args);

    expect(updatedGrowthHack._id).toEqual(args._id);
    expect(updatedGrowthHack.stageId).toEqual(args.stageId);
  });

  test('Remove growthHack', async () => {
    const mutation = `
      mutation growthHacksRemove($_id: String!) {
        growthHacksRemove(_id: $_id) {
          _id
        }
      }
    `;

    await graphqlRequest(mutation, 'growthHacksRemove', { _id: growthHack._id }, context);

    expect(await GrowthHacks.findOne({ _id: growthHack._id })).toBe(null);
  });

  test('Watch growthHack', async () => {
    const mutation = `
      mutation growthHacksWatch($_id: String!, $isAdd: Boolean!) {
        growthHacksWatch(_id: $_id, isAdd: $isAdd) {
          _id
          isWatched
        }
      }
    `;

    const watchAddGrowthHack = await graphqlRequest(
      mutation,
      'growthHacksWatch',
      { _id: growthHack._id, isAdd: true },
      context,
    );

    expect(watchAddGrowthHack.isWatched).toBe(true);

    const watchRemoveGrowthHack = await graphqlRequest(
      mutation,
      'growthHacksWatch',
      { _id: growthHack._id, isAdd: false },
      context,
    );

    expect(watchRemoveGrowthHack.isWatched).toBe(false);
  });

  test('Vote growthHack', async () => {
    const mutation = `
      mutation growthHacksVote($_id: String!, $isVote: Boolean!) {
        growthHacksVote(_id: $_id, isVote: $isVote) {
          _id
          voteCount
          isVoted
          votedUsers {
            _id
          }
        }
      }
    `;

    const votedGrowthHack = await graphqlRequest(
      mutation,
      'growthHacksVote',
      { _id: growthHack._id, isVote: true },
      context,
    );

    expect(votedGrowthHack.voteCount).toBe(1);
    expect(votedGrowthHack.votedUsers[0]._id).toBe(context.user._id);
    expect(votedGrowthHack.isVoted).toBe(true);

    const unvotedGrowthHack = await graphqlRequest(
      mutation,
      'growthHacksVote',
      { _id: growthHack._id, isVote: false },
      context,
    );

    expect(unvotedGrowthHack.voteCount).toBe(0);
    expect(unvotedGrowthHack.votedUsers.length).toBe(0);
    expect(unvotedGrowthHack.isVoted).toBe(false);
  });

  test('Test growthHacksCopy()', async () => {
    const mutation = `
      mutation growthHacksCopy($_id: String!) {
        growthHacksCopy(_id: $_id) {
          _id
          userId
          name
          stageId
        }
      }
    `;

    const checklist = await checklistFactory({
      contentType: 'growthHack',
      contentTypeId: growthHack._id,
      title: 'gh-checklist',
    });

    await checklistItemFactory({
      checklistId: checklist._id,
      content: 'Improve growthHack mutation test coverage',
      isChecked: true,
    });

    const result = await graphqlRequest(mutation, 'growthHacksCopy', { _id: growthHack._id }, context);

    const clonedGhChecklist = await Checklists.findOne({ contentTypeId: result._id });

    if (clonedGhChecklist) {
      const clonedGhChecklistItems = await ChecklistItems.find({ checklistId: clonedGhChecklist._id });

      expect(clonedGhChecklist.contentTypeId).toBe(result._id);
      expect(clonedGhChecklistItems.length).toBe(1);
    }

    expect(result.name).toBe(`${growthHack.name}-copied`);
    expect(result.stageId).toBe(growthHack.stageId);
  });

  test('Growth hack archive', async () => {
    const mutation = `
      mutation growthHacksArchive($stageId: String!) {
        growthHacksArchive(stageId: $stageId)
      }
    `;

    const ghStage = await stageFactory({ type: BOARD_TYPES.GROWTH_HACK });

    await growthHackFactory({ stageId: ghStage._id });
    await growthHackFactory({ stageId: ghStage._id });
    await growthHackFactory({ stageId: ghStage._id });

    await graphqlRequest(mutation, 'growthHacksArchive', { stageId: ghStage._id });

    const ghs = await GrowthHacks.find({ stageId: ghStage._id, status: BOARD_STATUSES.ARCHIVED });

    expect(ghs.length).toBe(3);
  });
});
