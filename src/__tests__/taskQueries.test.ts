import { graphqlRequest } from '../db/connection';
import {
  boardFactory,
  companyFactory,
  conformityFactory,
  customerFactory,
  pipelineFactory,
  stageFactory,
  taskFactory,
  userFactory,
} from '../db/factories';
import { Tasks } from '../db/models';

import { BOARD_TYPES } from '../db/models/definitions/constants';
import './setup.ts';

describe('taskQueries', () => {
  const commonTaskTypes = `
    _id
    name
    stageId
    assignedUserIds
    closeDate
    description
    companies {
      _id
    }
    customers {
      _id
    }
    assignedUsers {
      _id
    }
    isWatched
    hasNotified
    labels { _id }
    pipeline { _id }
    boardId
    stage { _id }
  `;

  const qryTaskFilter = `
    query tasks(
      $stageId: String
      $assignedUserIds: [String]
      $customerIds: [String]
      $companyIds: [String]
      $priority: [String]
      $closeDateType: String
    ) {
      tasks(
        stageId: $stageId
        customerIds: $customerIds
        assignedUserIds: $assignedUserIds
        companyIds: $companyIds
        priority: $priority
        closeDateType: $closeDateType
      ) {
        ${commonTaskTypes}
      }
    }
  `;

  const qryDetail = `
    query taskDetail($_id: String!) {
      taskDetail(_id: $_id) {
        ${commonTaskTypes}
      }
    }
  `;

  afterEach(async () => {
    // Clearing test data
    await Tasks.deleteMany({});
  });

  test('Task filter by team members', async () => {
    const { _id } = await userFactory();

    await taskFactory({ assignedUserIds: [_id] });

    const response = await graphqlRequest(qryTaskFilter, 'tasks', { assignedUserIds: [_id] });

    expect(response.length).toBe(1);
  });

  test('Task filter by customers', async () => {
    const { _id } = await customerFactory();

    const task = await taskFactory({});

    await conformityFactory({
      mainType: 'task',
      mainTypeId: task._id,
      relType: 'customer',
      relTypeId: _id,
    });

    const response = await graphqlRequest(qryTaskFilter, 'tasks', { customerIds: [_id] });

    expect(response.length).toBe(1);
  });

  test('Task filter by companies', async () => {
    const { _id } = await companyFactory();

    const task = await taskFactory({});

    await conformityFactory({
      mainType: 'company',
      mainTypeId: _id,
      relType: 'task',
      relTypeId: task._id,
    });

    const response = await graphqlRequest(qryTaskFilter, 'tasks', { companyIds: [_id] });

    expect(response.length).toBe(1);
  });

  test('Task filter by priority', async () => {
    await taskFactory({ priority: 'critical' });

    const response = await graphqlRequest(qryTaskFilter, 'tasks', { priority: ['critical'] });

    expect(response.length).toBe(1);
  });

  test('Tasks', async () => {
    const board = await boardFactory({ type: BOARD_TYPES.TASK });
    const pipeline = await pipelineFactory({ boardId: board._id, type: BOARD_TYPES.TASK });
    const stage = await stageFactory({ pipelineId: pipeline._id, type: BOARD_TYPES.TASK });

    const args = { stageId: stage._id };

    await taskFactory(args);
    await taskFactory(args);
    await taskFactory(args);

    const qryList = `
      query tasks($stageId: String!) {
        tasks(stageId: $stageId) {
          ${commonTaskTypes}
        }
      }
    `;

    const response = await graphqlRequest(qryList, 'tasks', args);

    expect(response.length).toBe(3);
  });

  test('Task detail', async () => {
    const task = await taskFactory();
    const response = await graphqlRequest(qryDetail, 'taskDetail', { _id: task._id });

    expect(response._id).toBe(task._id);
  });

  test('Task detail with watchedUserIds', async () => {
    const user = await userFactory();
    const watchedTask = await taskFactory({ watchedUserIds: [user._id] });

    const response = await graphqlRequest(
      qryDetail,
      'taskDetail',
      {
        _id: watchedTask._id,
      },
      { user },
    );

    expect(response._id).toBe(watchedTask._id);
    expect(response.isWatched).toBe(true);
  });
});
