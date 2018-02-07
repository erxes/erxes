/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { DealBoards, DealPipelines, DealStages, Deals } from '../db/models';
import {
  dealBoardFactory,
  dealPipelineFactory,
  dealStageFactory,
  dealFactory,
  userFactory,
} from '../db/factories';
import dealMutations from '../data/resolvers/mutations/deals';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Test deals mutations', () => {
  let _board, _pipeline, _stage, _deal, _user;

  beforeEach(async () => {
    // Creating test data
    _board = await dealBoardFactory();
    _pipeline = await dealPipelineFactory({ boardId: _board._id });
    _stage = await dealStageFactory({
      pipelineId: _pipeline._id,
      boardId: _board._id,
    });
    _deal = await dealFactory({
      pipelineId: _pipeline._id,
      boardId: _board._id,
      stageId: _stage._id,
    });
    _user = await userFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await DealBoards.remove({});
    await DealPipelines.remove({});
    await DealStages.remove({});
    await Deals.remove({});
  });

  test('Check login required', async () => {
    expect.assertions(12);

    const check = async fn => {
      try {
        await fn({}, {}, {});
      } catch (e) {
        expect(e.message).toEqual('Login required');
      }
    };

    // add
    check(dealMutations.dealBoardsAdd);

    // edit
    check(dealMutations.dealBoardsEdit);

    // remove
    check(dealMutations.dealBoardsRemove);

    // add
    check(dealMutations.dealPipelinesAdd);

    // edit
    check(dealMutations.dealPipelinesEdit);

    // remove
    check(dealMutations.dealPipelinesRemove);

    // add
    check(dealMutations.dealStagesAdd);

    // edit
    check(dealMutations.dealStagesEdit);

    // remove
    check(dealMutations.dealStagesRemove);

    // add
    check(dealMutations.dealsAdd);

    // edit
    check(dealMutations.dealsEdit);

    // remove
    check(dealMutations.dealsRemove);
  });
});
