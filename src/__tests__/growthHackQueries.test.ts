import { graphqlRequest } from '../db/connection';
import { growthHackFactory, pipelineFactory, stageFactory, userFactory } from '../db/factories';
import { GrowthHacks } from '../db/models';

import './setup.ts';

describe('growthHackQueries', () => {
  const commonGrowthHackTypes = `
    _id
    name
    stageId
    assignedUserIds
    closeDate
    description
    assignedUsers {
      _id
    }
  `;

  const qryGrowthHackFilter = `
    query growthHacks(
      $stageId: String 
      $assignedUserIds: [String]
      $closeDateType: String
    ) {
      growthHacks(
        stageId: $stageId 
        assignedUserIds: $assignedUserIds
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

  test('GrowthHack filter by team members', async () => {
    const { _id } = await userFactory();

    await growthHackFactory({ assignedUserIds: [_id] });

    const response = await graphqlRequest(qryGrowthHackFilter, 'growthHacks', { assignedUserIds: [_id] });

    expect(response.length).toBe(1);
  });

  test('GrowthHacks', async () => {
    const stage = await stageFactory();

    const args = { stageId: stage._id };

    await growthHackFactory(args);
    await growthHackFactory(args);
    await growthHackFactory(args);

    const qry = `
      query growthHacks($stageId: String!) {
        growthHacks(stageId: $stageId) {
          ${commonGrowthHackTypes}
        }
      }
    `;

    const response = await graphqlRequest(qry, 'growthHacks', args);

    expect(response.length).toBe(3);
  });

  test('GrowthHack detail', async () => {
    const pipeline = await pipelineFactory();
    const stage = await stageFactory({ pipelineId: pipeline._id });
    const growthHack = await growthHackFactory({ stageId: stage._id });

    const args = { _id: growthHack._id };

    const qry = `
      query growthHackDetail($_id: String!) {
        growthHackDetail(_id: $_id) {
          ${commonGrowthHackTypes}
        }
      }
    `;

    const response = await graphqlRequest(qry, 'growthHackDetail', args);

    expect(response._id).toBe(growthHack._id);
  });
});
