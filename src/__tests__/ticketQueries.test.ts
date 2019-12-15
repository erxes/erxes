import { graphqlRequest } from '../db/connection';
import {
  boardFactory,
  companyFactory,
  conformityFactory,
  customerFactory,
  pipelineFactory,
  stageFactory,
  ticketFactory,
  userFactory,
} from '../db/factories';
import { Tickets } from '../db/models';

import { BOARD_TYPES } from '../db/models/definitions/constants';
import './setup.ts';

describe('ticketQueries', () => {
  const commonTicketTypes = `
    _id
    name
    stageId
    assignedUserIds
    closeDate
    description
    companies { _id }
    customers { _id }
    assignedUsers { _id }
    boardId
    pipeline { _id }
    stage { _id }
    isWatched
    hasNotified
    labels { _id }
  `;

  const qryTicketFilter = `
    query tickets(
      $stageId: String
      $assignedUserIds: [String]
      $customerIds: [String]
      $companyIds: [String]
      $priority: [String]
      $source: [String]
      $closeDateType: String
    ) {
      tickets(
        stageId: $stageId
        customerIds: $customerIds
        assignedUserIds: $assignedUserIds
        companyIds: $companyIds
        priority: $priority
        source: $source
        closeDateType: $closeDateType
      ) {
        ${commonTicketTypes}
      }
    }
  `;

  const qryDetail = `
    query ticketDetail($_id: String!) {
      ticketDetail(_id: $_id) {
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

  test('Ticket filter by priority', async () => {
    await ticketFactory({ priority: 'critical' });

    const response = await graphqlRequest(qryTicketFilter, 'tickets', { priority: ['critical'] });

    expect(response.length).toBe(1);
  });

  test('Ticket filter by source', async () => {
    await ticketFactory({ source: 'messenger' });

    const response = await graphqlRequest(qryTicketFilter, 'tickets', { source: ['messenger'] });

    expect(response.length).toBe(1);
  });

  test('Tickets', async () => {
    const board = await boardFactory({ type: BOARD_TYPES.TICKET });
    const pipeline = await pipelineFactory({ boardId: board._id, type: BOARD_TYPES.TICKET });
    const stage = await stageFactory({ pipelineId: pipeline._id, type: BOARD_TYPES.TICKET });

    const args = { stageId: stage._id };

    await ticketFactory(args);
    await ticketFactory(args);
    await ticketFactory(args);

    const qryList = `
      query tickets($stageId: String!) {
        tickets(stageId: $stageId) {
          ${commonTicketTypes}
        }
      }
    `;

    const response = await graphqlRequest(qryList, 'tickets', args);

    expect(response.length).toBe(3);
  });

  test('Ticket detail', async () => {
    const ticket = await ticketFactory();

    const args = { _id: ticket._id };

    const response = await graphqlRequest(qryDetail, 'ticketDetail', args);

    expect(response._id).toBe(ticket._id);
  });

  test('Ticket detail with watchedUserIds', async () => {
    const user = await userFactory();
    const watchedTask = await ticketFactory({ watchedUserIds: [user._id] });

    const response = await graphqlRequest(
      qryDetail,
      'ticketDetail',
      {
        _id: watchedTask._id,
      },
      { user },
    );

    expect(response._id).toBe(watchedTask._id);
    expect(response.isWatched).toBe(true);
  });
});
