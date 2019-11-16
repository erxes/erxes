import { graphqlRequest } from '../db/connection';
import {
  companyFactory,
  conformityFactory,
  customerFactory,
  pipelineFactory,
  stageFactory,
  taskFactory,
  userFactory,
} from '../db/factories';
import { Tasks } from '../db/models';

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
  `;

  const qryTaskFilter = `
    query tasks(
      $stageId: String
      $assignedUserIds: [String]
      $customerIds: [String]
      $companyIds: [String]
      $closeDateType: String
    ) {
      tasks(
        stageId: $stageId
        customerIds: $customerIds
        assignedUserIds: $assignedUserIds
        companyIds: $companyIds
        closeDateType: $closeDateType
      ) {
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

  test('Tasks', async () => {
    const stage = await stageFactory();

    const args = { stageId: stage._id };

    await taskFactory(args);
    await taskFactory(args);
    await taskFactory(args);

    const qry = `
      query tasks($stageId: String!) {
        tasks(stageId: $stageId) {
          ${commonTaskTypes}
        }
      }
    `;

    const response = await graphqlRequest(qry, 'tasks', args);

    expect(response.length).toBe(3);
  });

  test('Task detail', async () => {
    const pipeline = await pipelineFactory();
    const stage = await stageFactory({ pipelineId: pipeline._id });
    const task = await taskFactory({ stageId: stage._id });

    const args = { _id: task._id };

    const qry = `
      query taskDetail($_id: String!) {
        taskDetail(_id: $_id) {
          ${commonTaskTypes}
        }
      }
    `;

    const response = await graphqlRequest(qry, 'taskDetail', args);

    expect(response._id).toBe(task._id);
  });
});
