import { graphqlRequest } from '../db/connection';
import {
  boardFactory,
  pipelineFactory,
  pipelineLabelFactory,
  stageFactory,
  taskFactory,
  userFactory,
} from '../db/factories';
import { Boards, PipelineLabels, Pipelines, Stages, Tasks } from '../db/models';
import { IBoardDocument, IPipelineDocument, IStageDocument } from '../db/models/definitions/boards';
import { BOARD_TYPES } from '../db/models/definitions/constants';
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
  `;

  const commonTaskParams = `
    name: $name
    stageId: $stageId
    assignedUserIds: $assignedUserIds
  `;

  beforeEach(async () => {
    // Creating test data
    board = await boardFactory({ type: BOARD_TYPES.TASK });
    pipeline = await pipelineFactory({ boardId: board._id });
    stage = await stageFactory({ pipelineId: pipeline._id });
    label = await pipelineLabelFactory({ pipelineId: pipeline._id });
    label2 = await pipelineLabelFactory({ pipelineId: pipeline._id, name: 'new label' });
    task = await taskFactory({ stageId: stage._id, labelIds: [label._id, label2._id] });
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
      _id: task._id,
      destinationStageId: task.stageId || '',
    };

    const mutation = `
      mutation tasksChange($_id: String!, $destinationStageId: String) {
        tasksChange(_id: $_id, destinationStageId: $destinationStageId) {
          _id,
          stageId
        }
      }
    `;

    const updatedTask = await graphqlRequest(mutation, 'tasksChange', args);

    expect(updatedTask._id).toEqual(args._id);
  });

  test('Task update orders', async () => {
    const taskToStage = await taskFactory({});

    const args = {
      orders: [{ _id: task._id, order: 9 }, { _id: taskToStage._id, order: 3 }],
      stageId: stage._id,
    };

    const mutation = `
      mutation tasksUpdateOrder($stageId: String!, $orders: [OrderItem]) {
        tasksUpdateOrder(stageId: $stageId, orders: $orders) {
          _id
          stageId
          order
        }
      }
    `;

    const [updatedTask, updatedTaskToOrder] = await graphqlRequest(mutation, 'tasksUpdateOrder', args);

    expect(updatedTask.order).toBe(3);
    expect(updatedTaskToOrder.order).toBe(9);
    expect(updatedTask.stageId).toBe(stage._id);
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
});
