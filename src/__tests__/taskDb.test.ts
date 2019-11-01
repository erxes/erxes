import { boardFactory, pipelineFactory, stageFactory, taskFactory, userFactory } from '../db/factories';
import { Boards, Pipelines, Stages, Tasks } from '../db/models';
import { IBoardDocument, IPipelineDocument, IStageDocument } from '../db/models/definitions/boards';
import { ITaskDocument } from '../db/models/definitions/tasks';
import { IUserDocument } from '../db/models/definitions/users';

import './setup.ts';

describe('Test tasks model', () => {
  let board: IBoardDocument;
  let pipeline: IPipelineDocument;
  let stage: IStageDocument;
  let task: ITaskDocument;
  let user: IUserDocument;

  beforeEach(async () => {
    // Creating test data
    board = await boardFactory();
    pipeline = await pipelineFactory({ boardId: board._id });
    stage = await stageFactory({ pipelineId: pipeline._id });
    task = await taskFactory({ stageId: stage._id });
    user = await userFactory({});
  });

  afterEach(async () => {
    // Clearing test data
    await Boards.deleteMany({});
    await Pipelines.deleteMany({});
    await Stages.deleteMany({});
    await Tasks.deleteMany({});
  });

  // Test task
  test('Create task', async () => {
    const createdTask = await Tasks.createTask({
      stageId: task.stageId,
      userId: user._id,
    });

    expect(createdTask).toBeDefined();
    expect(createdTask.stageId).toEqual(stage._id);
    expect(createdTask.createdAt).toEqual(task.createdAt);
    expect(createdTask.userId).toEqual(user._id);
  });

  test('Update task', async () => {
    const taskStageId = 'fakeId';
    const updatedTask = await Tasks.updateTask(task._id, {
      stageId: taskStageId,
    });

    expect(updatedTask).toBeDefined();
    expect(updatedTask.stageId).toEqual(taskStageId);
    expect(updatedTask.closeDate).toEqual(task.closeDate);
  });

  test('Update task orders', async () => {
    const dealToOrder = await taskFactory({});

    const [updatedTask, updatedDealToOrder] = await Tasks.updateOrder(stage._id, [
      { _id: task._id, order: 9 },
      { _id: dealToOrder._id, order: 3 },
    ]);

    expect(updatedTask.stageId).toBe(stage._id);
    expect(updatedTask.order).toBe(3);
    expect(updatedDealToOrder.order).toBe(9);
  });
});
