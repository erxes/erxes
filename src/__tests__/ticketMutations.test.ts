import { graphqlRequest } from '../db/connection';
import { boardFactory, pipelineFactory, stageFactory, ticketFactory, userFactory } from '../db/factories';
import { Boards, Pipelines, Stages, Tickets } from '../db/models';
import { IBoardDocument, IPipelineDocument, IStageDocument } from '../db/models/definitions/boards';
import { BOARD_TYPES } from '../db/models/definitions/constants';
import { ITicketDocument } from '../db/models/definitions/tickets';

import './setup.ts';

describe('Test tickets mutations', () => {
  let board: IBoardDocument;
  let pipeline: IPipelineDocument;
  let stage: IStageDocument;
  let ticket: ITicketDocument;
  let context;

  const commonTicketParamDefs = `
    $name: String!,
    $stageId: String!
  `;

  const commonTicketParams = `
    name: $name
    stageId: $stageId
  `;

  beforeEach(async () => {
    // Creating test data
    board = await boardFactory({ type: BOARD_TYPES.TICKET });
    pipeline = await pipelineFactory({ boardId: board._id });
    stage = await stageFactory({ pipelineId: pipeline._id });
    ticket = await ticketFactory({ stageId: stage._id });
    context = { user: await userFactory({}) };
  });

  afterEach(async () => {
    // Clearing test data
    await Boards.deleteMany({});
    await Pipelines.deleteMany({});
    await Stages.deleteMany({});
    await Tickets.deleteMany({});
  });

  test('Create ticket', async () => {
    const args = {
      name: ticket.name,
      stageId: stage._id,
    };

    const mutation = `
      mutation ticketsAdd(${commonTicketParamDefs}) {
        ticketsAdd(${commonTicketParams}) {
          _id
          name
          stageId
        }
      }
    `;

    const createdTicket = await graphqlRequest(mutation, 'ticketsAdd', args, context);

    expect(createdTicket.stageId).toEqual(stage._id);
  });

  test('Update ticket', async () => {
    const args = {
      _id: ticket._id,
      name: ticket.name,
      stageId: stage._id,
    };

    const mutation = `
      mutation ticketsEdit($_id: String!, ${commonTicketParamDefs}) {
        ticketsEdit(_id: $_id, ${commonTicketParams}) {
          _id
          name
          stageId
        }
      }
    `;

    const updatedTicket = await graphqlRequest(mutation, 'ticketsEdit', args, context);

    expect(updatedTicket.stageId).toEqual(stage._id);
  });

  test('Change ticket', async () => {
    const args = {
      _id: ticket._id,
      destinationStageId: ticket.stageId || '',
    };

    const mutation = `
      mutation ticketsChange($_id: String!, $destinationStageId: String) {
        ticketsChange(_id: $_id, destinationStageId: $destinationStageId) {
          _id,
          stageId
        }
      }
    `;

    const updatedTicket = await graphqlRequest(mutation, 'ticketsChange', args, context);

    expect(updatedTicket._id).toEqual(args._id);
  });

  test('Ticket update orders', async () => {
    const ticketToStage = await ticketFactory({});

    const args = {
      orders: [{ _id: ticket._id, order: 9 }, { _id: ticketToStage._id, order: 3 }],
      stageId: stage._id,
    };

    const mutation = `
      mutation ticketsUpdateOrder($stageId: String!, $orders: [OrderItem]) {
        ticketsUpdateOrder(stageId: $stageId, orders: $orders) {
          _id
          stageId
          order
        }
      }
    `;

    const [updatedTicket, updatedTicketToOrder] = await graphqlRequest(mutation, 'ticketsUpdateOrder', args, context);

    expect(updatedTicket.order).toBe(3);
    expect(updatedTicketToOrder.order).toBe(9);
    expect(updatedTicket.stageId).toBe(stage._id);
  });

  test('Remove ticket', async () => {
    const mutation = `
      mutation ticketsRemove($_id: String!) {
        ticketsRemove(_id: $_id) {
          _id
        }
      }
    `;

    await graphqlRequest(mutation, 'ticketsRemove', { _id: ticket._id }, context);

    expect(await Tickets.findOne({ _id: ticket._id })).toBe(null);
  });

  test('Watch ticket', async () => {
    const mutation = `
      mutation ticketsWatch($_id: String!, $isAdd: Boolean!) {
        ticketsWatch(_id: $_id, isAdd: $isAdd) {
          _id
          isWatched
        }
      }
    `;

    const watchAddTicket = await graphqlRequest(mutation, 'ticketsWatch', { _id: ticket._id, isAdd: true }, context);

    expect(watchAddTicket.isWatched).toBe(true);

    const watchRemoveTicket = await graphqlRequest(
      mutation,
      'ticketsWatch',
      { _id: ticket._id, isAdd: false },
      context,
    );

    expect(watchRemoveTicket.isWatched).toBe(false);
  });
});
