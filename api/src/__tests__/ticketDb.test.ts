import {
  boardFactory,
  conversationFactory,
  pipelineFactory,
  stageFactory,
  ticketFactory,
  userFactory
} from '../db/factories';
import { Boards, Pipelines, Stages, Tickets } from '../db/models';
import {
  IBoardDocument,
  IPipelineDocument,
  IStageDocument
} from '../db/models/definitions/boards';
import { ITicketDocument } from '../db/models/definitions/tickets';
import { IUserDocument } from '../db/models/definitions/users';

import './setup.ts';

describe('Test Tickets model', () => {
  let board: IBoardDocument;
  let pipeline: IPipelineDocument;
  let stage: IStageDocument;
  let ticket: ITicketDocument;
  let user: IUserDocument;

  beforeEach(async () => {
    // Creating test data
    board = await boardFactory();
    pipeline = await pipelineFactory({ boardId: board._id });
    stage = await stageFactory({ pipelineId: pipeline._id });
    ticket = await ticketFactory({ stageId: stage._id });
    user = await userFactory({});
  });

  afterEach(async () => {
    // Clearing test data
    await Boards.deleteMany({});
    await Pipelines.deleteMany({});
    await Stages.deleteMany({});
    await Tickets.deleteMany({});
  });

  test('Get ticket', async () => {
    try {
      await Tickets.getTicket('fakeId');
    } catch (e) {
      expect(e.message).toBe('Ticket not found');
    }

    const response = await Tickets.getTicket(ticket._id);

    expect(response).toBeDefined();
  });

  test('Create ticket', async () => {
    const createdTicket = await Tickets.createTicket({
      stageId: ticket.stageId,
      userId: user._id
    });

    expect(createdTicket).toBeDefined();
    expect(createdTicket.stageId).toEqual(stage._id);
    expect(createdTicket.userId).toEqual(user._id);
  });

  test('Create ticket Error(`Already converted a ticket`)', async () => {
    const conversation = await conversationFactory();

    const args = {
      stageId: ticket.stageId,
      sourceConversationId: conversation._id,
      userId: user._id
    };

    const createdTicket = await Tickets.createTicket(args);

    expect(createdTicket).toBeDefined();

    // Already converted a ticket
    try {
      await Tickets.createTicket(args);
    } catch (e) {
      expect(e.message).toBe('Already converted a ticket');
    }
  });

  test('Update ticket', async () => {
    const ticketStageId = 'fakeId';
    const updatedTicket = await Tickets.updateTicket(ticket._id, {
      stageId: ticketStageId
    });

    expect(updatedTicket).toBeDefined();
    expect(updatedTicket.stageId).toEqual(ticketStageId);
    expect(updatedTicket.closeDate).toEqual(ticket.closeDate);
  });

  test('Watch ticket', async () => {
    await Tickets.watchTicket(ticket._id, true, user._id);

    const watchedTicket = await Tickets.getTicket(ticket._id);

    expect(watchedTicket.watchedUserIds).toContain(user._id);

    // testing unwatch
    await Tickets.watchTicket(ticket._id, false, user._id);

    const unwatchedTicket = await Tickets.getTicket(ticket._id);

    expect(unwatchedTicket.watchedUserIds).not.toContain(user._id);
  });

  test('Test removeTickets()', async () => {
    await Tickets.removeTickets([ticket._id]);

    const removed = await Tickets.findOne({ _id: ticket._id });

    expect(removed).toBe(null);
  });
});
