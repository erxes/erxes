import { graphqlRequest } from '../db/connection';
import {
  boardFactory,
  fieldFactory,
  formFactory,
  formSubmissionFactory,
  growthHackFactory,
  pipelineFactory,
  stageFactory,
  userFactory,
} from '../db/factories';
import { GrowthHacks } from '../db/models';

import { BOARD_STATUSES, BOARD_TYPES } from '../db/models/definitions/constants';
import './setup.ts';

describe('growthHackQueries', () => {
  const commonGrowthHackTypes = `
    _id
    name
    stageId
    assignedUserIds
    closeDate
    description
    pipeline { _id }
    assignedUsers { _id }
    impact
    labels { _id }
    createdUser { _id }
    votedUsers { _id }
    stage { _id }
    isVoted
    boardId
    formId
    scoringType
    isWatched
    formSubmissions
    formFields { _id }
  `;

  const qryGrowthHackFilter = `
    query growthHacks(
      $stageId: String 
      $assignedUserIds: [String]
      $priority: [String]
      $hackStage: [String]
      $closeDateType: String
    ) {
      growthHacks(
        stageId: $stageId 
        assignedUserIds: $assignedUserIds
        priority: $priority
        hackStage: $hackStage
        closeDateType: $closeDateType
      ) {
        ${commonGrowthHackTypes}
      }
    }
  `;

  afterEach(async () => {
    // Clearing test data
    await GrowthHacks.deleteMany({});
  });

  test('Filter by team members', async () => {
    const { _id } = await userFactory();

    await growthHackFactory({ assignedUserIds: [_id] });

    const response = await graphqlRequest(qryGrowthHackFilter, 'growthHacks', { assignedUserIds: [_id] });

    expect(response.length).toBe(1);
  });

  test('Filter by priority', async () => {
    await growthHackFactory({ priority: 'critical' });

    const response = await graphqlRequest(qryGrowthHackFilter, 'growthHacks', { priority: ['critical'] });

    expect(response.length).toBe(1);
  });

  test('Filter by hack stage', async () => {
    await growthHackFactory({ hackStages: ['Awareness'] });

    const response = await graphqlRequest(qryGrowthHackFilter, 'growthHacks', { hackStage: ['Awareness'] });

    expect(response.length).toBe(1);
  });

  test('Growth hacks', async () => {
    const board = await boardFactory({ type: BOARD_TYPES.GROWTH_HACK });
    const pipeline = await pipelineFactory({ boardId: board._id });
    const stage = await stageFactory({ pipelineId: pipeline._id });

    await growthHackFactory({ impact: 5, stageId: stage._id });
    await growthHackFactory({ impact: 10, stageId: stage._id });
    await growthHackFactory({ impact: 2, stageId: stage._id });

    const qry = `
      query growthHacks($stageId: String, $sortField: String, $sortDirection: Int) {
        growthHacks(stageId: $stageId, sortField: $sortField, sortDirection: $sortDirection) {
          ${commonGrowthHackTypes}
        }
      }
    `;

    let response = await graphqlRequest(qry, 'growthHacks', { stageId: stage._id });

    expect(response.length).toBe(3);

    // sort descending by impact
    response = await graphqlRequest(qry, 'growthHacks', { stageId: stage._id, sortField: 'impact', sortDirection: -1 });

    expect(response[0].impact).toBe(10);
  });

  test('Growth hacks total count', async () => {
    await growthHackFactory({ hackStages: ['Awareness'] });
    await growthHackFactory({ hackStages: ['Awareness'] });
    await growthHackFactory();
    await growthHackFactory();

    const qry = `
      query growthHacksTotalCount($hackStage: [String]) {
        growthHacksTotalCount(hackStage: $hackStage)
      }
    `;

    const filter = { hackStage: ['Awareness'] };

    const totalCount = await graphqlRequest(qry, 'growthHacksTotalCount', filter);

    expect(totalCount).toBe(2);
  });

  test('Growth hacks priority matrix', async () => {
    const pipeline = await pipelineFactory();
    const stage = await stageFactory({ pipelineId: pipeline._id });

    await growthHackFactory({ impact: 5, ease: 4, stageId: stage._id });
    await growthHackFactory({ impact: 7, ease: 2, stageId: stage._id });

    await growthHackFactory({ impact: 5, stageId: stage._id });
    await growthHackFactory({ impact: 5, ease: 0, stageId: stage._id });
    await growthHackFactory({ stageId: stage._id });

    const qry = `
      query growthHacksPriorityMatrix($pipelineId: String) {
        growthHacksPriorityMatrix(pipelineId: $pipelineId)
      }
    `;

    const priorityMatrix = await graphqlRequest(qry, 'growthHacksPriorityMatrix', { pipelineId: pipeline._id });

    expect(priorityMatrix.length).toBe(2);
  });

  test('GrowthHack detail', async () => {
    const form = await formFactory();
    const field = await fieldFactory({
      contentType: 'form',
      contentTypeId: form._id,
    });

    const boardWithForm = await boardFactory({ type: BOARD_TYPES.GROWTH_HACK });
    const pipelineWithForm = await pipelineFactory({ boardId: boardWithForm._id });
    const stageWithForm = await stageFactory({ pipelineId: pipelineWithForm._id, formId: form._id });

    const user = await userFactory();
    const growthHackWithForm = await growthHackFactory({
      stageId: stageWithForm._id,
      watchedUserIds: [user._id],
      votedUserIds: [user._id],
    });

    await formSubmissionFactory({
      formId: form._id,
      contentTypeId: growthHackWithForm._id,
      contentType: 'growthHack',
      formFieldId: field._id,
      value: 'Hey',
    });

    await formSubmissionFactory({
      formId: form._id,
      contentTypeId: growthHackWithForm._id,
      contentType: 'growthHack',
    });

    const qry = `
      query growthHackDetail($_id: String!) {
        growthHackDetail(_id: $_id) {
          ${commonGrowthHackTypes}
        }
      }
    `;

    let response = await graphqlRequest(qry, 'growthHackDetail', { _id: growthHackWithForm._id }, { user });

    expect(response._id).toBe(growthHackWithForm._id);
    expect(response.isWatched).toBe(true);
    expect(response.formSubmissions[field._id]).toBe('Hey');
    expect(response.isVoted).toBe(true);

    const growthHack = await growthHackFactory();
    response = await graphqlRequest(qry, 'growthHackDetail', { _id: growthHack._id });

    expect(response._id).toBe(growthHack._id);
    expect(response.isVoted).toBe(false);
  });

  test('Get archived growth hacks', async () => {
    const pipeline = await pipelineFactory({ type: BOARD_TYPES.GROWTH_HACK });
    const stage = await stageFactory({ pipelineId: pipeline._id });
    const args = {
      stageId: stage._id,
      status: BOARD_STATUSES.ARCHIVED,
    };

    await growthHackFactory({ ...args, name: 'james' });
    await growthHackFactory({ ...args, name: 'jone' });
    await growthHackFactory({ ...args, name: 'gerrad' });

    const qry = `
      query archivedGrowthHacks(
        $pipelineId: String!,
        $search: String,
        $page: Int,
        $perPage: Int
      ) {
        archivedGrowthHacks(
          pipelineId: $pipelineId
          search: $search
          page: $page
          perPage: $perPage
        ) {
          _id
        }
      }
    `;

    let response = await graphqlRequest(qry, 'archivedGrowthHacks', {
      pipelineId: pipeline._id,
    });

    expect(response.length).toBe(3);

    response = await graphqlRequest(qry, 'archivedGrowthHacks', {
      pipelineId: pipeline._id,
      search: 'james',
    });

    expect(response.length).toBe(1);

    response = await graphqlRequest(qry, 'archivedGrowthHacks', {
      pipelineId: 'fakeId',
    });

    expect(response.length).toBe(0);
  });

  test('Get archived growth hacks count', async () => {
    const pipeline = await pipelineFactory({ type: BOARD_TYPES.GROWTH_HACK });
    const stage = await stageFactory({ pipelineId: pipeline._id });
    const args = {
      stageId: stage._id,
      status: BOARD_STATUSES.ARCHIVED,
    };

    await growthHackFactory({ ...args, name: 'james' });
    await growthHackFactory({ ...args, name: 'jone' });
    await growthHackFactory({ ...args, name: 'gerrad' });

    const qry = `
      query archivedGrowthHacksCount(
        $pipelineId: String!,
        $search: String,
      ) {
        archivedGrowthHacksCount(
          pipelineId: $pipelineId
          search: $search
        )
      }
    `;

    let response = await graphqlRequest(qry, 'archivedGrowthHacksCount', {
      pipelineId: pipeline._id,
    });

    expect(response).toBe(3);

    response = await graphqlRequest(qry, 'archivedGrowthHacksCount', {
      pipelineId: pipeline._id,
      search: 'james',
    });

    expect(response).toBe(1);

    response = await graphqlRequest(qry, 'archivedGrowthHacksCount', {
      pipelineId: 'fakeId',
    });

    expect(response).toBe(0);
  });
});
