import { connect, disconnect, graphqlRequest } from '../db/connection';
import { dealBoardFactory, dealFactory, dealPipelineFactory, dealStageFactory, userFactory } from '../db/factories';
import { DealBoards, DealPipelines, Deals, DealStages } from '../db/models';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Test deals mutations', () => {
  let board;
  let pipeline;
  let stage;
  let deal;
  let context;

  const commonPipelineParamDefs = `
    $name: String!,
    $boardId: String!,
    $stages: JSON
  `;

  const commonPipelineParams = `
    name: $name
    boardId: $boardId
    stages: $stages
  `;

  const commonStageParamDefs = `
    $name: String!,
    $pipelineId: String!
  `;

  const commonStageParams = `
    name: $name
    pipelineId: $pipelineId
  `;

  const commonDealParamDefs = `
    $name: String!,
    $stageId: String!
  `;

  const commonDealParams = `
    name: $name
    stageId: $stageId
  `;

  beforeEach(async () => {
    // Creating test data
    board = await dealBoardFactory();
    pipeline = await dealPipelineFactory({ boardId: board._id });
    stage = await dealStageFactory({ pipelineId: pipeline._id });
    deal = await dealFactory({ stageId: stage._id });
    context = { user: await userFactory({ role: 'admin' }) };
  });

  afterEach(async () => {
    // Clearing test data
    await DealBoards.remove({});
    await DealPipelines.remove({});
    await DealStages.remove({});
    await Deals.remove({});
  });

  test('Create board', async () => {
    const args = { name: 'deal board' };

    const mutation = `
      mutation dealBoardsAdd($name: String!) {
        dealBoardsAdd(name: $name) {
          _id
          name
        }
      }
    `;

    const createdBoard = await graphqlRequest(mutation, 'dealBoardsAdd', args, context);

    expect(createdBoard.name).toEqual(args.name);
  });

  test('Update board', async () => {
    const args = { _id: board._id, name: 'deal board' };

    const mutation = `
      mutation dealBoardsEdit($_id: String!, $name: String!) {
        dealBoardsEdit(name: $name, _id: $_id) {
          _id
          name
        }
      }
    `;

    const updatedBoard = await graphqlRequest(mutation, 'dealBoardsEdit', args, context);

    expect(updatedBoard.name).toEqual(args.name);
  });

  test('Remove board', async () => {
    // disconnect pipeline connected to board
    await DealPipelines.update({}, { $set: { boardId: 'fakeBoardId' } });

    const mutation = `
      mutation dealBoardsRemove($_id: String!) {
        dealBoardsRemove(_id: $_id)
      }
    `;

    await graphqlRequest(mutation, 'dealBoardsRemove', { _id: board._id }, context);

    expect(await DealBoards.findOne({ _id: board._id })).toBe(null);
  });

  test('Create pipeline', async () => {
    const args = {
      name: 'deal pipeline',
      boardId: board._id,
      stages: [stage],
    };

    const mutation = `
      mutation dealPipelinesAdd(${commonPipelineParamDefs}) {
        dealPipelinesAdd(${commonPipelineParams}) {
          _id
          name
          boardId
        }
      }
    `;

    const createdPipeline = await graphqlRequest(mutation, 'dealPipelinesAdd', args, context);

    // stage connected to pipeline
    const stageToPipeline = await DealStages.findOne({ _id: stage._id });

    if (!stageToPipeline) {
      throw new Error('Stage not found');
    }

    expect(createdPipeline._id).toEqual(stageToPipeline.pipelineId);
    expect(createdPipeline.name).toEqual(args.name);
    expect(createdPipeline.boardId).toEqual(board._id);
  });

  test('Update pipeline', async () => {
    const args = {
      _id: pipeline._id,
      name: 'deal pipeline',
      boardId: board._id,
      stages: [stage],
    };

    const mutation = `
      mutation dealPipelinesEdit($_id: String!, ${commonPipelineParamDefs}) {
        dealPipelinesEdit(_id: $_id, ${commonPipelineParams}) {
          _id
          name
          boardId
        }
      }
    `;

    const updatedPipeline = await graphqlRequest(mutation, 'dealPipelinesEdit', args, context);

    // stage connected to pipeline
    const stageToPipeline = await DealStages.findOne({ _id: stage._id });

    if (!stageToPipeline) {
      throw new Error('Stage not found');
    }

    expect(updatedPipeline._id).toEqual(stageToPipeline.pipelineId);
    expect(updatedPipeline.name).toEqual(args.name);
    expect(updatedPipeline.boardId).toEqual(board._id);
  });

  test('Pipeline update orders', async () => {
    const pipelineToUpdate = await dealPipelineFactory({});

    const args = {
      orders: [{ _id: pipeline._id, order: 9 }, { _id: pipelineToUpdate._id, order: 3 }],
    };

    const mutation = `
      mutation dealPipelinesUpdateOrder($orders: [OrderItem]) {
        dealPipelinesUpdateOrder(orders: $orders) {
          _id
          order
        }
      }
    `;

    const [updatedPipeline, updatedPipelineToOrder] = await graphqlRequest(
      mutation,
      'dealPipelinesUpdateOrder',
      args,
      context,
    );

    expect(updatedPipeline.order).toBe(3);
    expect(updatedPipelineToOrder.order).toBe(9);
  });

  test('Remove pipeline', async () => {
    // disconnect stages connected to pipeline
    await DealStages.update({}, { $set: { pipelineId: 'fakePipelineId' } });

    const mutation = `
      mutation dealPipelinesRemove($_id: String!) {
        dealPipelinesRemove(_id: $_id)
      }
    `;

    await graphqlRequest(mutation, 'dealPipelinesRemove', { _id: pipeline._id }, context);

    expect(await DealPipelines.findOne({ _id: pipeline._id })).toBe(null);
  });

  test('Create stage', async () => {
    const args = {
      name: 'deal stage',
      pipelineId: pipeline._id,
    };

    const mutation = `
      mutation dealStagesAdd(${commonStageParamDefs}) {
        dealStagesAdd(${commonStageParams}) {
          _id
          name
          pipelineId
        }
      }
    `;

    const createdStage = await graphqlRequest(mutation, 'dealStagesAdd', args, context);

    expect(createdStage.name).toEqual(args.name);
    expect(createdStage.pipelineId).toEqual(pipeline._id);
  });

  test('Update stage', async () => {
    const args = {
      _id: stage._id,
      name: 'deal stage',
      pipelineId: pipeline._id,
    };

    const mutation = `
      mutation dealStagesEdit($_id: String!, ${commonStageParamDefs}) {
        dealStagesEdit(_id: $_id, ${commonStageParams}) {
          _id
          name
          pipelineId
        }
      }
    `;

    const updatedStage = await graphqlRequest(mutation, 'dealStagesEdit', args, context);

    expect(updatedStage.name).toEqual(args.name);
    expect(updatedStage.pipelineId).toEqual(pipeline._id);
  });

  test('Change stage', async () => {
    const args = {
      _id: stage._id,
      pipelineId: 'fakePipelineId',
    };

    const mutation = `
      mutation dealStagesChange($_id: String!, $pipelineId: String!) {
        dealStagesChange(_id: $_id, pipelineId: $pipelineId) {
          _id
          pipelineId
        }
      }
    `;

    const updatedStage = await graphqlRequest(mutation, 'dealStagesChange', args, context);

    expect(updatedStage.pipelineId).toEqual(args.pipelineId);
  });

  test('Stage update orders', async () => {
    const stageToUpdate = await dealStageFactory({});

    const args = {
      orders: [{ _id: stage._id, order: 9 }, { _id: stageToUpdate._id, order: 3 }],
    };

    const mutation = `
      mutation dealStagesUpdateOrder($orders: [OrderItem]) {
        dealStagesUpdateOrder(orders: $orders) {
          _id
          order
        }
      }
    `;

    const [updatedStage, updatedStageToOrder] = await graphqlRequest(mutation, 'dealStagesUpdateOrder', args, context);

    expect(updatedStage.order).toBe(3);
    expect(updatedStageToOrder.order).toBe(9);
  });

  test('Remove stage', async () => {
    // disconnect deals connected to stage
    await Deals.update({}, { $set: { stageId: 'fakeStageId' } });

    const mutation = `
      mutation dealStagesRemove($_id: String!) {
        dealStagesRemove(_id: $_id)
      }
    `;

    await graphqlRequest(mutation, 'dealStagesRemove', { _id: stage._id }, context);

    expect(await DealStages.findOne({ _id: stage._id })).toBe(null);
  });

  test('Create deal', async () => {
    const args = {
      name: deal.name,
      stageId: stage._id,
    };

    const mutation = `
      mutation dealsAdd(${commonDealParamDefs}) {
        dealsAdd(${commonDealParams}) {
          _id
          name
          stageId
        }
      }
    `;

    const createdDeal = await graphqlRequest(mutation, 'dealsAdd', args, context);

    expect(createdDeal.stageId).toEqual(stage._id);
  });

  test('Update deal', async () => {
    const args = {
      _id: deal._id,
      name: deal.name,
      stageId: stage._id,
    };

    const mutation = `
      mutation dealsEdit($_id: String!, ${commonDealParamDefs}) {
        dealsEdit(_id: $_id, ${commonDealParams}) {
          _id
          name
          stageId
        }
      }
    `;

    const updatedDeal = await graphqlRequest(mutation, 'dealsEdit', args, context);

    expect(updatedDeal.stageId).toEqual(stage._id);
  });

  test('Change deal', async () => {
    const args = {
      _id: deal._id,
      stageId: 'fakeStageId',
    };

    const mutation = `
      mutation dealsChange($_id: String!, $stageId: String!) {
        dealsChange(_id: $_id, stageId: $stageId) {
          _id
          stageId
        }
      }
    `;

    const updatedDeal = await graphqlRequest(mutation, 'dealsChange', args, context);

    expect(updatedDeal.stageId).toEqual(args.stageId);
  });

  test('Deal update orders', async () => {
    const dealToStage = await dealFactory({});

    const args = {
      orders: [{ _id: deal._id, order: 9 }, { _id: dealToStage._id, order: 3 }],
    };

    const mutation = `
      mutation dealsUpdateOrder($orders: [OrderItem]) {
        dealsUpdateOrder(orders: $orders) {
          _id
          order
        }
      }
    `;

    const [updatedDeal, updatedDealToOrder] = await graphqlRequest(mutation, 'dealsUpdateOrder', args, context);

    expect(updatedDeal.order).toBe(3);
    expect(updatedDealToOrder.order).toBe(9);
  });

  test('Remove deal', async () => {
    const mutation = `
      mutation dealsRemove($_id: String!) {
        dealsRemove(_id: $_id) {
          _id
        }
      }
    `;

    await graphqlRequest(mutation, 'dealsRemove', { _id: deal._id }, context);

    expect(await Deals.findOne({ _id: deal._id })).toBe(null);
  });
});
