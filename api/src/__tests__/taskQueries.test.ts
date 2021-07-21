import { graphqlRequest } from '../db/connection';
import {
  boardFactory,
  companyFactory,
  conformityFactory,
  customerFactory,
  pipelineFactory,
  stageFactory,
  taskFactory,
  userFactory
} from '../db/factories';
import { Tasks } from '../db/models';

import {
  BOARD_STATUSES,
  BOARD_TYPES
} from '../db/models/definitions/constants';
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
    assignedUsers
    isWatched
    hasNotified
    labels { _id }
    pipeline { _id }
    boardId
    stage { _id }
    createdUser { _id }
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
        _id
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

    const response = await graphqlRequest(qryTaskFilter, 'tasks', {
      assignedUserIds: [_id]
    });

    expect(response.length).toBe(1);
  });

  test('Task filter by customers', async () => {
    const { _id } = await customerFactory();

    const task = await taskFactory({});

    await conformityFactory({
      mainType: 'task',
      mainTypeId: task._id,
      relType: 'customer',
      relTypeId: _id
    });

    process.env.ELK_SYNCER = 'false';
    const response = await graphqlRequest(qryTaskFilter, 'tasks', {
      customerIds: [_id]
    });

    expect(response.length).toBe(1);
  });

  test('Task filter by companies', async () => {
    const { _id } = await companyFactory();

    const task = await taskFactory({});

    await conformityFactory({
      mainType: 'company',
      mainTypeId: _id,
      relType: 'task',
      relTypeId: task._id
    });

    const response = await graphqlRequest(qryTaskFilter, 'tasks', {
      companyIds: [_id]
    });

    expect(response.length).toBe(1);
  });

  test('Task filter by priority', async () => {
    await taskFactory({ priority: 'critical' });

    const response = await graphqlRequest(qryTaskFilter, 'tasks', {
      priority: ['critical']
    });

    expect(response.length).toBe(1);
  });

  test('Tasks', async () => {
    const board = await boardFactory({ type: BOARD_TYPES.TASK });
    const pipeline = await pipelineFactory({
      boardId: board._id,
      type: BOARD_TYPES.TASK
    });
    const stage = await stageFactory({
      pipelineId: pipeline._id,
      type: BOARD_TYPES.TASK
    });

    const args = { stageId: stage._id };

    await taskFactory(args);
    await taskFactory(args);
    await taskFactory(args);

    const qryList = `
      query tasks($stageId: String!) {
        tasks(stageId: $stageId) {
          _id
        }
      }
    `;

    const response = await graphqlRequest(qryList, 'tasks', args);

    expect(response.length).toBe(3);
  });

  test('Tasks total count', async () => {
    const stage = await stageFactory({});
    const currentUser = await userFactory({});

    const args = { stageId: stage._id };

    await taskFactory(args);
    await taskFactory(args);

    const qry = `
      query tasksTotalCount($stageId: String!) {
        tasksTotalCount(stageId: $stageId)
      }
    `;

    const response = await graphqlRequest(qry, 'tasksTotalCount', args, {
      user: currentUser
    });

    expect(response).toBe(2);
  });

  test('Task detail', async () => {
    const task = await taskFactory();
    const response = await graphqlRequest(qryDetail, 'taskDetail', {
      _id: task._id
    });

    expect(response._id).toBe(task._id);
  });

  test('Task detail with watchedUserIds', async () => {
    const user = await userFactory();
    const watchedTask = await taskFactory({ watchedUserIds: [user._id] });

    const response = await graphqlRequest(
      qryDetail,
      'taskDetail',
      {
        _id: watchedTask._id
      },
      { user }
    );

    expect(response._id).toBe(watchedTask._id);
    expect(response.isWatched).toBe(true);
  });

  test('Get archived task', async () => {
    const pipeline = await pipelineFactory({ type: BOARD_TYPES.TASK });
    const stage = await stageFactory({ pipelineId: pipeline._id });
    const args = {
      stageId: stage._id,
      status: BOARD_STATUSES.ARCHIVED
    };

    await taskFactory({ ...args, name: 'james' });
    await taskFactory({ ...args, name: 'jone' });
    await taskFactory({ ...args, name: 'gerrad' });

    const qry = `
      query archivedTasks(
        $pipelineId: String!,
        $search: String,
        $page: Int,
        $perPage: Int
      ) {
        archivedTasks(
          pipelineId: $pipelineId
          search: $search
          page: $page
          perPage: $perPage
        ) {
          _id
        }
      }
    `;

    let response = await graphqlRequest(qry, 'archivedTasks', {
      pipelineId: pipeline._id
    });

    expect(response.length).toBe(3);

    response = await graphqlRequest(qry, 'archivedTasks', {
      pipelineId: pipeline._id,
      search: 'james'
    });

    expect(response.length).toBe(1);

    response = await graphqlRequest(qry, 'archivedTasks', {
      pipelineId: 'fakeId'
    });

    expect(response.length).toBe(0);
  });

  test('Get archived task count ', async () => {
    const pipeline = await pipelineFactory({ type: BOARD_TYPES.TASK });
    const stage = await stageFactory({ pipelineId: pipeline._id });
    const args = {
      stageId: stage._id,
      status: BOARD_STATUSES.ARCHIVED
    };

    await taskFactory({ ...args, name: 'james' });
    await taskFactory({ ...args, name: 'jone' });
    await taskFactory({ ...args, name: 'gerrad' });

    const qry = `
      query archivedTasksCount(
        $pipelineId: String!,
        $search: String,
      ) {
        archivedTasksCount(
          pipelineId: $pipelineId
          search: $search
        )
      }
    `;

    let response = await graphqlRequest(qry, 'archivedTasksCount', {
      pipelineId: pipeline._id
    });

    expect(response).toBe(3);

    response = await graphqlRequest(qry, 'archivedTasksCount', {
      pipelineId: pipeline._id,
      search: 'james'
    });

    expect(response).toBe(1);

    response = await graphqlRequest(qry, 'archivedTasksCount', {
      pipelineId: 'fakeId'
    });

    expect(response).toBe(0);
  });
});
