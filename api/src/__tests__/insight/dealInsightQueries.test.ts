import * as moment from 'moment';
import dealInsightQueries from '../../data/resolvers/queries/dealInsights';
import { graphqlRequest } from '../../db/connection';
import {
  boardFactory,
  dealFactory,
  pipelineFactory,
  stageFactory,
  userFactory
} from '../../db/factories';
import { Boards, Deals, Pipelines, Stages } from '../../db/models';

import '../setup.ts';

const paramsDef = `
  $pipelineIds: String,
  $boardId: String,
  $startDate: String,
  $endDate: String,
  $status: String
`;

const paramsValue = `
  pipelineIds: $pipelineIds,
  boardId: $boardId,
  startDate: $startDate,
  endDate: $endDate,
  status: $status
`;

describe('dealInsightQueries', () => {
  let board;
  let pipeline;
  let stage;
  let deal;
  let doc;

  const endDate = moment()
    .add(1, 'days')
    .format('YYYY-MM-DD HH:mm');

  const startDate = moment(endDate)
    .add(-7, 'days')
    .format('YYYY-MM-DD HH:mm');

  beforeEach(async () => {
    // creating test data
    board = await boardFactory();
    pipeline = await pipelineFactory({ boardId: board._id });
    stage = await stageFactory({ pipelineId: pipeline._id });
    deal = await dealFactory({ stageId: stage._id });

    doc = {
      pipelineIds: pipeline._id,
      boardId: board._id,
      startDate,
      endDate
    };
  });

  afterEach(async () => {
    // Clearing test data
    await Boards.deleteMany({});
    await Pipelines.deleteMany({});
    await Stages.deleteMany({});
    await Deals.deleteMany({});
  });

  test(`test if Error('Login required') exception is working as intended`, async () => {
    expect.assertions(3);

    const expectError = async func => {
      try {
        await func(null, {}, {});
      } catch (e) {
        expect(e.message).toBe('Login required');
      }
    };

    expectError(dealInsightQueries.dealInsightsPunchCard);
    expectError(dealInsightQueries.dealInsightsMain);
    expectError(dealInsightQueries.dealInsightsByTeamMember);
  });

  test('dealInsightsPunchCard', async () => {
    const qry = `
      query dealInsightsPunchCard(${paramsDef}) {
        dealInsightsPunchCard(${paramsValue})
      }
    `;

    const response = await graphqlRequest(qry, 'dealInsightsPunchCard', doc);
    expect(response.length).toBe(1);
  });

  test('dealInsightsMain', async () => {
    const qry = `
      query dealInsightsMain(${paramsDef}) {
        dealInsightsMain(${paramsValue})
      }
    `;

    let response = await graphqlRequest(qry, 'dealInsightsMain', doc);

    expect(response.trend.length).toBe(1);

    doc.status = 'won';
    response = await graphqlRequest(qry, 'dealInsightsMain', doc);

    expect(response.trend.length).toBe(0);
  });

  test('dealInsightsByTeamMember', async () => {
    const user = await userFactory({});

    await Deals.findByIdAndUpdate(deal._id, {
      modifiedAt: new Date(),
      modifiedBy: user._id
    });

    const deal2 = await dealFactory({ stageId: stage._id });
    const user2 = await userFactory({});

    await Deals.findByIdAndUpdate(deal2._id, {
      modifiedAt: new Date(),
      modifiedBy: user2._id
    });

    const qry = `
      query dealInsightsByTeamMember(${paramsDef}) {
        dealInsightsByTeamMember(${paramsValue})
      }
    `;

    let response = await graphqlRequest(qry, 'dealInsightsByTeamMember', doc);
    expect(response.length).toBe(2);

    doc.boardId = 'fakeBoardId';

    response = await graphqlRequest(qry, 'dealInsightsByTeamMember', {
      boardId: 'fakeBoardId'
    });
    expect(response.length).toBe(0);
  });
});
