import {
  boardFactory,
  companyFactory,
  customerFactory,
  pipelineFactory,
  stageFactory,
  taskFactory,
  userFactory,
} from '../db/factories';
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

  test('Task change customer', async () => {
    const newCustomer = await customerFactory({});

    const customer1 = await customerFactory({});
    const customer2 = await customerFactory({});
    const dealObj = await taskFactory({
      customerIds: [customer2._id, customer1._id],
    });

    await Tasks.changeCustomer(newCustomer._id, [customer2._id, customer1._id]);

    const result = await Tasks.findOne({ _id: dealObj._id });

    if (!result) {
      throw new Error('Task not found');
    }

    expect(result.customerIds).toContain(newCustomer._id);
    expect(result.customerIds).not.toContain(customer1._id);
    expect(result.customerIds).not.toContain(customer2._id);
  });

  test('Task change company', async () => {
    const newCompany = await companyFactory({});

    const company1 = await companyFactory({});
    const company2 = await companyFactory({});
    const dealObj = await taskFactory({
      companyIds: [company1._id, company2._id],
    });

    await Tasks.changeCompany(newCompany._id, [company1._id, company2._id]);

    const result = await Tasks.findOne({ _id: dealObj._id });

    if (!result) {
      throw new Error('Task not found');
    }

    expect(result.companyIds).toContain(newCompany._id);
    expect(result.companyIds).not.toContain(company1._id);
    expect(result.companyIds).not.toContain(company2._id);
  });
});
