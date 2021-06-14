import {
  activityLogFactory,
  boardFactory,
  checklistFactory,
  checklistItemFactory,
  conformityFactory,
  customerFactory,
  dealFactory,
  formFactory,
  internalNoteFactory,
  pipelineFactory,
  pipelineTemplateFactory,
  stageFactory,
  userFactory
} from '../db/factories';
import {
  Boards,
  ChecklistItems,
  Checklists,
  Conformities,
  Deals,
  Forms,
  InternalNotes,
  Pipelines,
  Stages
} from '../db/models';
import { getNewOrder } from '../db/models/boardUtils';
import {
  IBoardDocument,
  IPipelineDocument,
  IStageDocument
} from '../db/models/definitions/boards';
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
    await Pipelines.deleteMany({});
  });

  test('Get board', async () => {
    try {
      await Boards.getBoard('fakeId');
    } catch (e) {
      expect(e.message).toBe('Board not found');
    }

    const response = await Boards.getBoard(board._id);

    expect(response).toBeDefined();
  });

  // Test deal board
  test('Create board', async () => {
    const createdBoard = await Boards.createBoard({
      name: board.name,
      userId: user._id,
      type: 'deal'
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
      type: 'deal'
    });

    expect(updatedBoard).toBeDefined();
    expect(updatedBoard.name).toEqual(boardName);
    expect(updatedBoard.userId).toEqual(user._id);
  });

  test('Remove board', async () => {
    const removeBoard = await boardFactory();

    const removedPipeline = await pipelineFactory({ boardId: removeBoard._id });

    const isDeleted = await Boards.removeBoard(removeBoard.id);

    expect(isDeleted).toBeTruthy();
    expect(await Stages.findOne({ _id: removedPipeline._id })).toBeNull();
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

  // Test deal pipeline
  test('Create pipeline', async () => {
    const createdPipeline = await Pipelines.createPipeline(
      {
        name: pipeline.name,
        boardId: pipeline.boardId,
        userId: user._id,
        type: pipeline.type,
        bgColor: pipeline.bgColor
      },
      [stage.toJSON()]
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

  test('Create pipeline by templateId', async () => {
    const form = await formFactory();
    const formStage = await stageFactory({ formId: form._id });

    const template = await pipelineTemplateFactory({
      stages: [formStage]
    });

    const createdPipeline = await Pipelines.createPipeline(
      {
        boardId: board._id,
        name: pipeline.name,
        type: pipeline.type,
        templateId: template._id
      },
      []
    );

    expect(createdPipeline).toBeDefined();
    expect(createdPipeline.name).toEqual(pipeline.name);
    expect(createdPipeline.type).toEqual(pipeline.type);
    expect(createdPipeline.templateId).toEqual(template._id);
  });

  test('Create pipeline without stages', async () => {
    const createdPipeline = await Pipelines.createPipeline({
      boardId: board._id,
      name: pipeline.name,
      type: pipeline.type
    });

    expect(createdPipeline).toBeDefined();
    expect(createdPipeline.name).toEqual(pipeline.name);
    expect(createdPipeline.type).toEqual(pipeline.type);
  });

  test('Update pipeline', async () => {
    const args = {
      name: 'deal pipeline',
      type: 'deal',
      boardId: board._id,
      stages: [stage.toJSON()],
      visibility: 'public',
      bgColor: 'bbb'
    };

    const pipelineObj = await pipelineFactory({});

    const stageObj = await stageFactory({ pipelineId: pipelineObj._id });
    const testStage = await stageFactory({ pipelineId: pipelineObj._id });

    const updatedPipeline = await Pipelines.updatePipeline(
      pipelineObj._id,
      args,
      [stageObj.toJSON()]
    );

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

  test('Update pipeline by templateId', async () => {
    const form = await formFactory();
    const formStage = await stageFactory({ formId: form._id });

    const template = await pipelineTemplateFactory({
      stages: [formStage]
    });

    const args = {
      boardId: board._id,
      templateId: template._id,
      type: 'deal'
    };

    const pipelineObj = await pipelineFactory({ templateId: 'fakeId' });

    let updatedPipeline = await Pipelines.updatePipeline(
      pipelineObj._id,
      args,
      []
    );

    expect(updatedPipeline).toBeDefined();
    expect(updatedPipeline.templateId).toBe(template._id);

    const pipelineSameObj = await pipelineFactory({
      templateId: args.templateId
    });

    updatedPipeline = await Pipelines.updatePipeline(
      pipelineSameObj._id,
      args,
      []
    );

    expect(updatedPipeline).toBeDefined();
    expect(updatedPipeline.templateId).toBe(template._id);
  });

  test('Update pipeline without stages', async () => {
    const args = {
      boardId: board._id,
      name: 'updated',
      type: 'deal'
    };

    const updatedPipeline = await Pipelines.updatePipeline(pipeline._id, args);

    expect(updatedPipeline).toBeDefined();
    expect(updatedPipeline.name).toEqual(args.name);
    expect(updatedPipeline.type).toEqual(args.type);
  });

  test('Update pipeline orders', async () => {
    const pipelineToOrder = await pipelineFactory({});

    const [
      updatedPipeline,
      updatedPipelineToOrder
    ] = await Pipelines.updateOrder([
      { _id: pipeline._id, order: 5 },
      { _id: pipelineToOrder._id, order: 4 }
    ]);

    expect(updatedPipeline.order).toBe(4);
    expect(updatedPipelineToOrder.order).toBe(5);
  });

  test('Remove pipeline', async () => {
    const removePipeline = await pipelineFactory();
    const removedStage = await stageFactory({ pipelineId: removePipeline._id });

    const isDeleted = await Pipelines.removePipeline(removePipeline.id, true);

    expect(isDeleted).toBeTruthy();
    expect(await Stages.findOne({ _id: removedStage._id })).toBeNull();
  });

  test('Remove pipeline with stage items', async () => {
    const removePipeline = await pipelineFactory();
    const removedStage = await stageFactory({
      pipelineId: removePipeline._id,
      type: 'deal'
    });
    const stayStage = await stageFactory({
      pipelineId: (await pipelineFactory())._id,
      type: 'deal'
    });

    const helper = async pStage => {
      await dealFactory({ stageId: pStage._id });
      const deal = await dealFactory({ stageId: pStage._id });
      const checklist = await checklistFactory({
        contentType: 'deal',
        contentTypeId: deal._id
      });
      await checklistItemFactory({ checklistId: checklist._id });
      await internalNoteFactory({
        contentType: 'deal',
        contentTypeId: deal._id
      });
      await activityLogFactory({ contentType: 'deal', contentId: deal._id });
      const customer = await customerFactory({});
      await conformityFactory({
        mainType: 'customer',
        mainTypeId: customer._id,
        relType: 'deal',
        relTypeId: deal._id
      });
      return { deal, checklist };
    };

    let result = await helper(removedStage);
    const removedDeal = result.deal;
    const removedChecklist = result.checklist;

    result = await helper(stayStage);
    const stayDeal = result.deal;
    const stayChecklist = result.checklist;

    const isDeleted = await Pipelines.removePipeline(removePipeline.id, false);

    expect(isDeleted).toBeTruthy();
    expect(await Stages.findOne({ _id: removedStage._id })).toBeNull();

    const checkHelper = async (deal, checklist, eqCount) => {
      expect(await Deals.countDocuments({ _id: deal._id })).toEqual(eqCount);
      expect(
        await Checklists.countDocuments({
          contentType: 'deal',
          contentTypeId: deal._id
        })
      ).toEqual(eqCount);
      expect(
        await ChecklistItems.countDocuments({ checklistId: checklist._id })
      ).toEqual(eqCount);
      expect(
        await Conformities.countDocuments({
          relType: 'deal',
          relTypeId: deal._id
        })
      ).toEqual(eqCount);
      expect(
        await InternalNotes.countDocuments({
          contentType: 'deal',
          contentTypeId: deal._id
        })
      ).toEqual(eqCount);
    };
    await checkHelper(removedDeal, removedChecklist, 0);
    await checkHelper(stayDeal, stayChecklist, 1);
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

  test('Watch pipeline', async () => {
    await Pipelines.watchPipeline(pipeline._id, true, user._id);

    const watchedPipeline = await Pipelines.getPipeline(pipeline._id);

    expect(watchedPipeline.watchedUserIds).toContain(user._id);

    // testing unwatch
    await Pipelines.watchPipeline(pipeline._id, false, user._id);

    const unwatchedPipeline = await Pipelines.getPipeline(pipeline._id);

    expect(unwatchedPipeline.watchedUserIds).not.toContain(user._id);
  });

  test('Get stage', async () => {
    try {
      await Stages.getStage('fakeId');
    } catch (e) {
      expect(e.message).toBe('Stage not found');
    }

    const response = await Stages.getStage(stage._id);

    expect(response).toBeDefined();
  });

  test('Create stage', async () => {
    const createdStage = await Stages.createStage({
      name: stage.name,
      pipelineId: stage.pipelineId,
      userId: user._id,
      type: 'deal'
    });

    expect(createdStage).toBeDefined();
    expect(createdStage.name).toEqual(stage.name);
    expect(createdStage.type).toEqual(stage.type);
    expect(createdStage.pipelineId).toEqual(pipeline._id);
    expect(createdStage.createdAt).toEqual(stage.createdAt);
    expect(createdStage.userId).toEqual(user._id);
  });

  test('Remove stage', async () => {
    const stageNoItem = await stageFactory();
    const isDeleted = await Stages.removeStage(stageNoItem._id);

    expect(isDeleted).toBeTruthy();
  });

  test('Remove stage with form', async () => {
    const form = await formFactory();

    const stageWithForm = await stageFactory({ formId: form._id });

    const isDeleted = await Stages.removeStage(stageWithForm._id);

    expect(isDeleted).toBeTruthy();
    expect(await Forms.findOne({ _id: form._id })).toBeNull();
  });

  test('Update stage', async () => {
    const stageName = 'Update stage name';
    const updatedStage = await Stages.updateStage(stage._id, {
      name: stageName,
      userId: user._id,
      type: 'deal',
      pipelineId: pipeline._id
    });

    expect(updatedStage).toBeDefined();
    expect(updatedStage.name).toEqual(stageName);
  });

  test('Update stage orders', async () => {
    const stageToOrder = await stageFactory({});

    const [updatedStage, updatedStageToOrder] = await Stages.updateOrder([
      { _id: stage._id, order: 9 },
      { _id: stageToOrder._id, order: 5 }
    ]);

    expect(updatedStage.order).toBe(5);
    expect(updatedStageToOrder.order).toBe(9);
  });

  test('Update stage orders when orders length is zero', async () => {
    const response = await Stages.updateOrder([]);

    expect(response.length).toBe(0);
  });

  test('itemOrder test', async () => {
    let aboveItemId = '';
    const newStage = await stageFactory();
    expect(
      await getNewOrder({
        aboveItemId,
        stageId: newStage._id,
        collection: Deals
      })
    ).toBe(100);

    const firstDeal = await dealFactory({ stageId: newStage._id, order: 100 });
    expect(
      await getNewOrder({
        aboveItemId,
        stageId: newStage._id,
        collection: Deals
      })
    ).toBeGreaterThan(0);
    expect(
      await getNewOrder({
        aboveItemId,
        stageId: newStage._id,
        collection: Deals
      })
    ).toBeLessThan(100);

    aboveItemId = (await dealFactory({ stageId: newStage._id, order: 99 }))._id;
    expect(
      await getNewOrder({
        aboveItemId,
        stageId: newStage._id,
        collection: Deals
      })
    ).toBeGreaterThan(99);
    expect(
      await getNewOrder({
        aboveItemId,
        stageId: newStage._id,
        collection: Deals
      })
    ).toBeLessThan(100);

    expect(
      await getNewOrder({
        aboveItemId: firstDeal._id,
        stageId: newStage._id,
        collection: Deals
      })
    ).toBe(110);

    // duplicated then recall getNewOrder
    aboveItemId = (
      await dealFactory({ stageId: newStage._id, order: 99.99999999999999 })
    )._id;
    expect(
      await getNewOrder({
        aboveItemId,
        stageId: newStage._id,
        collection: Deals
      })
    ).toBeGreaterThan(110);
    expect(
      await getNewOrder({
        aboveItemId,
        stageId: newStage._id,
        collection: Deals
      })
    ).toBeLessThan(120);
  });
});
