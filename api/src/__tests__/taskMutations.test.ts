import { graphqlRequest } from '../db/connection';
import {
  boardFactory,
  checklistFactory,
  checklistItemFactory,
  companyFactory,
  conformityFactory,
  customerFactory,
  pipelineFactory,
  pipelineLabelFactory,
  stageFactory,
  taskFactory,
  userFactory,
} from '../db/factories';
import {
  Boards,
  ChecklistItems,
  Checklists,
  Conformities,
  PipelineLabels,
  Pipelines,
  Stages,
  Tasks,
} from '../db/models';
import { IBoardDocument, IPipelineDocument, IStageDocument } from '../db/models/definitions/boards';
import { BOARD_STATUSES, BOARD_TYPES, TIME_TRACK_TYPES } from '../db/models/definitions/constants';
import { IPipelineLabelDocument } from '../db/models/definitions/pipelineLabels';
import { ITaskDocument } from '../db/models/definitions/tasks';

import './setup.ts';

describe('Test tasks mutations', () => {
  let board: IBoardDocument;
  let pipeline: IPipelineDocument;
  let stage: IStageDocument;
  let task: ITaskDocument;
  let label: IPipelineLabelDocument;
  let label2: IPipelineLabelDocument;

  const commonTaskParamDefs = `
    $name: String!,
    $stageId: String!
    $assignedUserIds: [String]
    $status: String
  `;

  const commonTaskParams = `
    name: $name
    stageId: $stageId
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
    board = await boardFactory({ type: BOARD_TYPES.TASK });
    pipeline = await pipelineFactory({ boardId: board._id });
    stage = await stageFactory({ pipelineId: pipeline._id });
    label = await pipelineLabelFactory({ pipelineId: pipeline._id });
    label2 = await pipelineLabelFactory({ pipelineId: pipeline._id, name: 'new label' });
    task = await taskFactory({ initialStageId: stage._id, stageId: stage._id, labelIds: [label._id, label2._id] });
  });

  afterEach(async () => {
    // Clearing test data
    await Boards.deleteMany({});
    await Pipelines.deleteMany({});
    await Stages.deleteMany({});
    await Tasks.deleteMany({});
    await PipelineLabels.deleteMany({});
  });

  test('Create task', async () => {
    const args = {
      name: task.name,
      stageId: stage._id,
    };

    const mutation = `
      mutation tasksAdd(${commonTaskParamDefs}) {
        tasksAdd(${commonTaskParams}) {
          _id
          name
          stageId
        }
      }
    `;

    const response = await graphqlRequest(mutation, 'tasksAdd', args);

    expect(response.stageId).toEqual(stage._id);
  });

  test('Update task', async () => {
    const args: any = {
      _id: task._id,
      name: task.name,
      stageId: stage._id,
    };

    const mutation = `
      mutation tasksEdit($_id: String!, ${commonTaskParamDefs}) {
        tasksEdit(_id: $_id, ${commonTaskParams}) {
          _id
          name
          stageId
          labelIds
          assignedUserIds
        }
      }
    `;

    let updatedTask = await graphqlRequest(mutation, 'tasksEdit', args);

    expect(updatedTask.stageId).toEqual(stage._id);

    const user = await userFactory();
    args.assignedUserIds = [user.id];
    args.status = 'archived';

    updatedTask = await graphqlRequest(mutation, 'tasksEdit', args);

    expect(updatedTask.assignedUserIds.length).toBe(1);
  });

  test('Move task between pipelines', async () => {
    expect.assertions(3);

    const pipeline2 = await pipelineFactory();
    const stage2 = await stageFactory({ pipelineId: pipeline2._id });

    await pipelineLabelFactory({
      pipelineId: pipeline2._id,
      name: label.name,
      colorCode: label.colorCode,
    });

    const args: any = {
      _id: task._id,
      name: 'Edited task',
      stageId: stage2._id,
    };

    const mutation = `
      mutation tasksEdit($_id: String!, ${commonTaskParamDefs}) {
        tasksEdit(_id: $_id, ${commonTaskParams}) {
          _id
          name
          stageId
          labelIds
        }
      }
    `;

    let updatedTask = await graphqlRequest(mutation, 'tasksEdit', args);

    expect(updatedTask.stageId).toBe(stage2._id);

    if (task.labelIds) {
      const copiedLabels = await PipelineLabels.find({ pipelineId: pipeline2._id });

      expect(copiedLabels.length).toBe(2);
    }

    try {
      // to improve boardUtils coverage
      args.stageId = 'demo-stage';

      updatedTask = await graphqlRequest(mutation, 'tasksEdit', args);
    } catch (e) {
      expect(e[0].message).toBe('Stage not found');
    }
  });

  test('Change task', async () => {
    const args = {
      proccessId: Math.random().toString(),
      itemId: task._id,
      aboveItemId: '',
      destinationStageId: task.stageId,
      sourceStageId: task.stageId,
    };

    const mutation = `
      mutation tasksChange(${commonDragParamDefs}) {
        tasksChange(${commonDragParams}) {
          _id
          name
          stageId
          order
        }
      }
    `;
    const updatedTask = await graphqlRequest(mutation, 'tasksChange', args);

    expect(updatedTask._id).toEqual(args.itemId);
  });

  test('Change task if move to another stage', async () => {
    const anotherStage = await stageFactory({ pipelineId: pipeline._id });

    const args = {
      proccessId: Math.random().toString(),
      itemId: task._id,
      aboveItemId: '',
      destinationStageId: anotherStage._id,
      sourceStageId: task.stageId,
    };

    const mutation = `
      mutation tasksChange(${commonDragParamDefs}) {
        tasksChange(${commonDragParams}) {
          _id
          name
          stageId
          order
        }
      }
    `;

    const updatedTask = await graphqlRequest(mutation, 'tasksChange', args);

    expect(updatedTask._id).toEqual(args.itemId);
  });

  test('Update task move to pipeline stage', async () => {
    const mutation = `
      mutation tasksEdit($_id: String!, ${commonTaskParamDefs}) {
        tasksEdit(_id: $_id, ${commonTaskParams}) {
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
      _id: task._id,
      stageId: anotherStage._id,
      name: task.name || '',
    };

    const updatedTask = await graphqlRequest(mutation, 'tasksEdit', args);

    expect(updatedTask._id).toEqual(args._id);
    expect(updatedTask.stageId).toEqual(args.stageId);
  });

  test('Remove task', async () => {
    const mutation = `
      mutation tasksRemove($_id: String!) {
        tasksRemove(_id: $_id) {
          _id
        }
      }
    `;

    await graphqlRequest(mutation, 'tasksRemove', { _id: task._id });

    expect(await Tasks.findOne({ _id: task._id })).toBe(null);
  });

  test('Watch task', async () => {
    const mutation = `
      mutation tasksWatch($_id: String!, $isAdd: Boolean!) {
        tasksWatch(_id: $_id, isAdd: $isAdd) {
          _id
          isWatched
        }
      }
    `;

    const watchAddTask = await graphqlRequest(mutation, 'tasksWatch', { _id: task._id, isAdd: true });

    expect(watchAddTask.isWatched).toBe(true);

    const watchRemoveTask = await graphqlRequest(mutation, 'tasksWatch', { _id: task._id, isAdd: false });

    expect(watchRemoveTask.isWatched).toBe(false);
  });

  test('Test tasksCopy()', async () => {
    const mutation = `
      mutation tasksCopy($_id: String!) {
        tasksCopy(_id: $_id) {
          _id
          userId
          name
          stageId
        }
      }
    `;

    const checklist = await checklistFactory({
      contentType: 'task',
      contentTypeId: task._id,
      title: 'task-checklist',
    });

    await checklistItemFactory({
      checklistId: checklist._id,
      content: 'Improve task mutation test coverage',
      isChecked: true,
    });

    const company = await companyFactory();
    const customer = await customerFactory();
    const user = await userFactory();

    await conformityFactory({
      mainType: 'task',
      mainTypeId: task._id,
      relType: 'company',
      relTypeId: company._id,
    });

    await conformityFactory({
      mainType: 'task',
      mainTypeId: task._id,
      relType: 'customer',
      relTypeId: customer._id,
    });

    const result = await graphqlRequest(mutation, 'tasksCopy', { _id: task._id }, { user });

    const clonedTaskCompanies = await Conformities.find({ mainTypeId: result._id, relTypeId: company._id });
    const clonedTaskCustomers = await Conformities.find({ mainTypeId: result._id, relTypeId: company._id });
    const clonedTaskChecklist = await Checklists.findOne({ contentTypeId: result._id });

    if (clonedTaskChecklist) {
      const clonedTaskChecklistItems = await ChecklistItems.find({ checklistId: clonedTaskChecklist._id });

      expect(clonedTaskChecklist.contentTypeId).toBe(result._id);
      expect(clonedTaskChecklistItems.length).toBe(1);
    }

    expect(result.userId).toBe(user._id);
    expect(result.name).toBe(`${task.name}-copied`);
    expect(result.stageId).toBe(task.stageId);

    expect(clonedTaskCompanies.length).toBe(1);
    expect(clonedTaskCustomers.length).toBe(1);
  });

  test('Task archive', async () => {
    const mutation = `
      mutation tasksArchive($stageId: String!) {
        tasksArchive(stageId: $stageId)
      }
    `;

    const taskStage = await stageFactory({ type: BOARD_TYPES.TASK });

    await taskFactory({ stageId: taskStage._id });
    await taskFactory({ stageId: taskStage._id });
    await taskFactory({ stageId: taskStage._id });

    await graphqlRequest(mutation, 'tasksArchive', { stageId: taskStage._id });

    const tasks = await Tasks.find({ stageId: taskStage._id, status: BOARD_STATUSES.ARCHIVED });

    expect(tasks.length).toBe(3);
  });

  test('Task update time track', async () => {
    const mutation = `
      mutation taskUpdateTimeTracking($_id: String!, $status: String!, $timeSpent: Int!, $startDate: String) {
        taskUpdateTimeTracking(_id: $_id, status: $status, timeSpent: $timeSpent, startDate: $startDate)
      }
    `;

    const taskStage = await stageFactory({ type: BOARD_TYPES.TASK });

    await taskFactory({ stageId: taskStage._id });
    await taskFactory({ stageId: taskStage._id });
    await taskFactory({ stageId: taskStage._id });

    await graphqlRequest(mutation, 'taskUpdateTimeTracking', {
      _id: task._id,
      status: TIME_TRACK_TYPES.STARTED,
      timeSpent: 10,
      startDate: new Date().toISOString(),
    });

    const updatedTask = await Tasks.findOne({ _id: task._id });

    if (updatedTask && updatedTask.timeTrack) {
      expect(updatedTask.timeTrack.status).toBe(TIME_TRACK_TYPES.STARTED);
      expect(updatedTask.timeTrack.timeSpent).toBe(10);
    }
  });
});
