import { graphqlRequest } from '../db/connection';
import {
  boardFactory,
  checklistFactory,
  checklistItemFactory,
  companyFactory,
  conformityFactory,
  customerFactory,
  pipelineFactory,
  pipelineLabelFactory,
  stageFactory,
  ticketFactory,
  userFactory,
} from '../db/factories';
import {
  Boards,
  ChecklistItems,
  Checklists,
  Conformities,
  PipelineLabels,
  Pipelines,
  Stages,
  Tickets,
} from '../db/models';
import { IBoardDocument, IPipelineDocument, IStageDocument } from '../db/models/definitions/boards';
import { BOARD_STATUSES, BOARD_TYPES } from '../db/models/definitions/constants';
import { IPipelineLabelDocument } from '../db/models/definitions/pipelineLabels';
import { ITicketDocument } from '../db/models/definitions/tickets';

import './setup.ts';

describe('Test tickets mutations', () => {
  let board: IBoardDocument;
  let pipeline: IPipelineDocument;
  let stage: IStageDocument;
  let ticket: ITicketDocument;
  let label: IPipelineLabelDocument;
  let context;

  const commonTicketParamDefs = `
    $name: String!,
    $stageId: String!
    $assignedUserIds: [String]
    $status: String
  `;

  const commonTicketParams = `
    name: $name
    stageId: $stageId
    assignedUserIds: $assignedUserIds
    status: $status
  `;

  const commonDragParamDefs = `
    $itemId: String!,
    $aboveItemId: String,
    $destinationStageId: String!,
    $sourceStageId: String,
    $proccessId: String
  `;

  const commonDragParams = `
    itemId: $itemId,
    aboveItemId: $aboveItemId,
    destinationStageId: $destinationStageId,
    sourceStageId: $sourceStageId,
    proccessId: $proccessId
  `;

  beforeEach(async () => {
    // Creating test data
    board = await boardFactory({ type: BOARD_TYPES.TICKET });
    pipeline = await pipelineFactory({ boardId: board._id });
    stage = await stageFactory({ pipelineId: pipeline._id });
    label = await pipelineLabelFactory({ pipelineId: pipeline._id });
    ticket = await ticketFactory({ stageId: stage._id, labelIds: [label._id] });
    context = { user: await userFactory({}) };
  });

  afterEach(async () => {
    // Clearing test data
    await Boards.deleteMany({});
    await Pipelines.deleteMany({});
    await Stages.deleteMany({});
    await Tickets.deleteMany({});
    await PipelineLabels.deleteMany({});
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
    const args: any = {
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

    let updatedTicket = await graphqlRequest(mutation, 'ticketsEdit', args, context);

    expect(updatedTicket.stageId).toEqual(stage._id);

    const user = await userFactory();
    args.assignedUserIds = [user.id];
    args.status = 'archived';

    updatedTicket = await graphqlRequest(mutation, 'ticketsEdit', args);

    expect(updatedTicket.stageId).toEqual(stage._id);
  });

  test('Change ticket', async () => {
    const args = {
      proccessId: Math.random().toString(),
      itemId: ticket._id,
      aboveItemId: '',
      destinationStageId: ticket.stageId,
      sourceStageId: ticket.stageId,
    };

    const mutation = `
      mutation ticketsChange(${commonDragParamDefs}) {
        ticketsChange(${commonDragParams}) {
          _id
          name
          stageId
          order
        }
      }
    `;

    const updatedTicket = await graphqlRequest(mutation, 'ticketsChange', args, context);

    expect(updatedTicket._id).toEqual(args.itemId);
  });

  test('Change ticket if move to another stage', async () => {
    const anotherStage = await stageFactory({ pipelineId: pipeline._id });

    const args = {
      proccessId: Math.random().toString(),
      itemId: ticket._id,
      aboveItemId: '',
      destinationStageId: anotherStage._id,
      sourceStageId: ticket.stageId,
    };

    const mutation = `
      mutation ticketsChange(${commonDragParamDefs}) {
        ticketsChange(${commonDragParams}) {
          _id
          name
          stageId
          order
        }
      }
    `;

    const updatedTicket = await graphqlRequest(mutation, 'ticketsChange', args);

    expect(updatedTicket._id).toEqual(args.itemId);
  });

  test('Update ticket move to pipeline stage', async () => {
    const mutation = `
      mutation ticketsEdit($_id: String!, ${commonTicketParamDefs}) {
        ticketsEdit(_id: $_id, ${commonTicketParams}) {
          _id
          name
          stageId
          assignedUserIds
        }
      }
    `;

    const anotherPipeline = await pipelineFactory({ boardId: board._id });
    const anotherStage = await stageFactory({ pipelineId: anotherPipeline._id });

    const args = {
      _id: ticket._id,
      stageId: anotherStage._id,
      name: ticket.name || '',
    };

    const updatedTicket = await graphqlRequest(mutation, 'ticketsEdit', args);

    expect(updatedTicket._id).toEqual(args._id);
    expect(updatedTicket.stageId).toEqual(args.stageId);
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

  test('Test ticketsCopy()', async () => {
    const mutation = `
      mutation ticketsCopy($_id: String!) {
        ticketsCopy(_id: $_id) {
          _id
          userId
          name
          stageId
        }
      }
    `;

    const checklist = await checklistFactory({
      contentType: 'ticket',
      contentTypeId: ticket._id,
      title: 'ticket-checklist',
    });

    await checklistItemFactory({
      checklistId: checklist._id,
      content: 'Improve ticket mutation test coverage',
      isChecked: true,
    });

    const company = await companyFactory();
    const customer = await customerFactory();

    await conformityFactory({
      mainType: 'ticket',
      mainTypeId: ticket._id,
      relType: 'company',
      relTypeId: company._id,
    });

    await conformityFactory({
      mainType: 'ticket',
      mainTypeId: ticket._id,
      relType: 'customer',
      relTypeId: customer._id,
    });

    const result = await graphqlRequest(mutation, 'ticketsCopy', { _id: ticket._id }, context);

    const clonedTicketCompanies = await Conformities.find({ mainTypeId: result._id, relTypeId: company._id });
    const clonedTicketCustomers = await Conformities.find({ mainTypeId: result._id, relTypeId: company._id });
    const clonedTicketChecklist = await Checklists.findOne({ contentTypeId: result._id });

    if (clonedTicketChecklist) {
      const clonedTicketChecklistItems = await ChecklistItems.find({ checklistId: clonedTicketChecklist._id });

      expect(clonedTicketChecklist.contentTypeId).toBe(result._id);
      expect(clonedTicketChecklistItems.length).toBe(1);
    }

    expect(result.name).toBe(`${ticket.name}-copied`);
    expect(result.stageId).toBe(ticket.stageId);

    expect(clonedTicketCompanies.length).toBe(1);
    expect(clonedTicketCustomers.length).toBe(1);
  });

  test('Ticket archive', async () => {
    const mutation = `
      mutation ticketsArchive($stageId: String!) {
        ticketsArchive(stageId: $stageId)
      }
    `;

    const ticketStage = await stageFactory({ type: BOARD_TYPES.TICKET });

    await ticketFactory({ stageId: ticketStage._id });
    await ticketFactory({ stageId: ticketStage._id });
    await ticketFactory({ stageId: ticketStage._id });

    await graphqlRequest(mutation, 'ticketsArchive', { stageId: ticketStage._id });

    const tickets = await Tickets.find({ stageId: ticketStage._id, status: BOARD_STATUSES.ARCHIVED });

    expect(tickets.length).toBe(3);
  });
});
