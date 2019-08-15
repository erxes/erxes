import {
  boardFactory,
  companyFactory,
  customerFactory,
  pipelineFactory,
  stageFactory,
  ticketFactory,
  userFactory,
} from '../db/factories';
import { Boards, Pipelines, Stages, Tickets } from '../db/models';
import { IBoardDocument, IPipelineDocument, IStageDocument } from '../db/models/definitions/boards';
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

  // Test ticket
  test('Create ticket', async () => {
    const createdTicket = await Tickets.createTicket({
      stageId: ticket.stageId,
      userId: user._id,
    });

    expect(createdTicket).toBeDefined();
    expect(createdTicket.stageId).toEqual(stage._id);
    expect(createdTicket.createdAt).toEqual(ticket.createdAt);
    expect(createdTicket.userId).toEqual(user._id);
  });

  test('Update ticket', async () => {
    const ticketStageId = 'fakeId';
    const updatedTicket = await Tickets.updateTicket(ticket._id, {
      stageId: ticketStageId,
    });

    expect(updatedTicket).toBeDefined();
    expect(updatedTicket.stageId).toEqual(ticketStageId);
    expect(updatedTicket.closeDate).toEqual(ticket.closeDate);
  });

  test('Update ticket orders', async () => {
    const dealToOrder = await ticketFactory({});

    const [updatedTicket, updatedDealToOrder] = await Tickets.updateOrder(stage._id, [
      { _id: ticket._id, order: 9 },
      { _id: dealToOrder._id, order: 3 },
    ]);

    expect(updatedTicket.stageId).toBe(stage._id);
    expect(updatedTicket.order).toBe(3);
    expect(updatedDealToOrder.order).toBe(9);
  });

  test('Ticket change customer', async () => {
    const newCustomer = await customerFactory({});

    const customer1 = await customerFactory({});
    const customer2 = await customerFactory({});
    const dealObj = await ticketFactory({
      customerIds: [customer2._id, customer1._id],
    });

    await Tickets.changeCustomer(newCustomer._id, [customer2._id, customer1._id]);

    const result = await Tickets.findOne({ _id: dealObj._id });

    if (!result) {
      throw new Error('Ticket not found');
    }

    expect(result.customerIds).toContain(newCustomer._id);
    expect(result.customerIds).not.toContain(customer1._id);
    expect(result.customerIds).not.toContain(customer2._id);
  });

  test('Ticket change company', async () => {
    const newCompany = await companyFactory({});

    const company1 = await companyFactory({});
    const company2 = await companyFactory({});
    const dealObj = await ticketFactory({
      companyIds: [company1._id, company2._id],
    });

    await Tickets.changeCompany(newCompany._id, [company1._id, company2._id]);

    const result = await Tickets.findOne({ _id: dealObj._id });

    if (!result) {
      throw new Error('Ticket not found');
    }

    expect(result.companyIds).toContain(newCompany._id);
    expect(result.companyIds).not.toContain(company1._id);
    expect(result.companyIds).not.toContain(company2._id);
  });
});
