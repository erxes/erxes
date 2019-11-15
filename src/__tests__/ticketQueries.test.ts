import { graphqlRequest } from '../db/connection';
import {
  companyFactory,
  conformityFactory,
  customerFactory,
  pipelineFactory,
  stageFactory,
  ticketFactory,
  userFactory,
} from '../db/factories';
import { Tickets } from '../db/models';

import './setup.ts';

describe('ticketQueries', () => {
  const commonTicketTypes = `
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

  const qryTicketFilter = `
    query tickets(
      $stageId: String
      $assignedUserIds: [String]
      $customerIds: [String]
      $companyIds: [String]
      $nextDay: String
      $nextWeek: String
      $nextMonth: String
      $noCloseDate: String
      $overdue: String
    ) {
      tickets(
        stageId: $stageId
        customerIds: $customerIds
        assignedUserIds: $assignedUserIds
        companyIds: $companyIds
        nextDay: $nextDay
        nextWeek: $nextWeek
        nextMonth: $nextMonth
        noCloseDate: $noCloseDate
        overdue: $overdue
      ) {
        ${commonTicketTypes}
      }
    }
  `;

  afterEach(async () => {
    // Clearing test data
    await Tickets.deleteMany({});
  });

  test('Ticket filter by team members', async () => {
    const { _id } = await userFactory();

    await ticketFactory({ assignedUserIds: [_id] });

    const response = await graphqlRequest(qryTicketFilter, 'tickets', { assignedUserIds: [_id] });

    expect(response.length).toBe(1);
  });

  test('Ticket filter by customers', async () => {
    const { _id } = await customerFactory();

    const ticket = await ticketFactory({});

    await conformityFactory({
      mainType: 'ticket',
      mainTypeId: ticket._id,
      relType: 'customer',
      relTypeId: _id,
    });

    const response = await graphqlRequest(qryTicketFilter, 'tickets', { customerIds: [_id] });

    expect(response.length).toBe(1);
  });

  test('Ticket filter by companies', async () => {
    const { _id } = await companyFactory();

    const ticket = await ticketFactory({});

    await conformityFactory({
      mainType: 'company',
      mainTypeId: _id,
      relType: 'ticket',
      relTypeId: ticket._id,
    });

    const response = await graphqlRequest(qryTicketFilter, 'tickets', { companyIds: [_id] });

    expect(response.length).toBe(1);
  });

  test('Tickets', async () => {
    const stage = await stageFactory();

    const args = { stageId: stage._id };

    await ticketFactory(args);
    await ticketFactory(args);
    await ticketFactory(args);

    const qry = `
      query tickets($stageId: String!) {
        tickets(stageId: $stageId) {
          ${commonTicketTypes}
        }
      }
    `;

    const response = await graphqlRequest(qry, 'tickets', args);

    expect(response.length).toBe(3);
  });

  test('Ticket detail', async () => {
    const pipeline = await pipelineFactory();
    const stage = await stageFactory({ pipelineId: pipeline._id });
    const ticket = await ticketFactory({ stageId: stage._id });

    const args = { _id: ticket._id };

    const qry = `
      query ticketDetail($_id: String!) {
        ticketDetail(_id: $_id) {
          ${commonTicketTypes}
        }
      }
    `;

    const response = await graphqlRequest(qry, 'ticketDetail', args);

    expect(response._id).toBe(ticket._id);
  });
});
