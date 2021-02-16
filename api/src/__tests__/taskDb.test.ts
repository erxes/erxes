import {
  boardFactory,
  conversationFactory,
  pipelineFactory,
  stageFactory,
  taskFactory,
  userFactory
} from '../db/factories';
import { Boards, Pipelines, Stages, Tasks } from '../db/models';
import {
  IBoardDocument,
  IPipelineDocument,
  IStageDocument
} from '../db/models/definitions/boards';
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

  test('Get task', async () => {
    try {
      await Tasks.getTask('fakeId');
    } catch (e) {
      expect(e.message).toBe('Task not found');
    }

    const response = await Tasks.getTask(task._id);

    expect(response).toBeDefined();
  });

  // Test task
  test('Create task', async () => {
    const createdTask = await Tasks.createTask({
      stageId: task.stageId,
      userId: user._id
    });

    expect(createdTask).toBeDefined();
    expect(createdTask.stageId).toEqual(stage._id);
    expect(createdTask.userId).toEqual(user._id);
  });

  test('Create task Error(`Already converted a task`)', async () => {
    const conversation = await conversationFactory();

    const args = {
      stageId: task.stageId,
      userId: user._id,
      sourceConversationIds: [conversation._id]
    };

    const createdTicket = await Tasks.createTask(args);

    expect(createdTicket).toBeDefined();

    // Already converted a task
    try {
      await Tasks.createTask(args);
    } catch (e) {
      expect(e.message).toBe('Already converted a task');
    }
  });

  test('Update task', async () => {
    const taskStageId = 'fakeId';
    const updatedTask = await Tasks.updateTask(task._id, {
      stageId: taskStageId
    });

    expect(updatedTask).toBeDefined();
    expect(updatedTask.stageId).toEqual(taskStageId);
    expect(updatedTask.closeDate).toEqual(task.closeDate);
  });

  test('Watch task', async () => {
    await Tasks.watchTask(task._id, true, user._id);

    const watchedTask = await Tasks.getTask(task._id);

    expect(watchedTask.watchedUserIds).toContain(user._id);

    // testing unwatch
    await Tasks.watchTask(task._id, false, user._id);

    const unwatchedTask = await Tasks.getTask(task._id);

    expect(unwatchedTask.watchedUserIds).not.toContain(user._id);
  });

  test('Test removeTasks()', async () => {
    await Tasks.removeTasks([task._id]);

    const removed = await Tasks.findOne({ _id: task._id });

    expect(removed).toBe(null);
  });
});
