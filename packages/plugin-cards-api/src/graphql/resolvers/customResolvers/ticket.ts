import { IContext } from '../../../connectionResolver';
import { sendContactsMessage, sendCoreMessage, sendNotificationsMessage } from '../../../messageBroker';
import { ITicketDocument } from '../../../models/definitions/tickets';
import { boardId } from '../../utils';

export default {
  async companies(ticket: ITicketDocument) {
    const companyIds = await sendCoreMessage('savedConformity', {
      mainType: 'ticket',
      mainTypeId: ticket._id,
      relTypes: ['company']
    }, true, []);

    const companies = await sendCoreMessage('findActiveCompanies', { _id: { $in: companyIds } }, true, []);

    return (companies || []).map(({ _id }) => ({ __typename: "Company", _id }));
  },

  async customers(ticket: ITicketDocument) {
    const customerIds = await sendCoreMessage('savedConformity', {
      mainType: 'ticket',
      mainTypeId: ticket._id,
      relTypes: ['customer']
    }, true, []);

    const customers = await sendContactsMessage('findActiveCustomers', {
      _id: { $in: customerIds }
    }, true, []);

    return (customers || []).map(({ _id }) => ({ __typename: "Customer", _id }));
  },

  assignedUsers(ticket: ITicketDocument) {
    return (ticket.assignedUserIds || []).map(_id => ({ __typename: "User", _id }));
  },

  async pipeline(ticket: ITicketDocument, _args, { models: { Stages, Pipelines } }: IContext) {
    const stage = await Stages.getStage(ticket.stageId);

    return Pipelines.findOne({ _id: stage.pipelineId });
  },

  boardId(ticket: ITicketDocument, { models }: IContext) {
    return boardId(models, ticket);
  },

  stage(ticket: ITicketDocument, _args, { models: { Stages } }: IContext) {
    return Stages.getStage(ticket.stageId);
  },

  isWatched(ticket: ITicketDocument, _args, { user }: IContext) {
    const watchedUserIds = ticket.watchedUserIds || [];

    if (watchedUserIds.includes(user._id)) {
      return true;
    }

    return false;
  },

  hasNotified(ticket: ITicketDocument, _args, { user }: IContext) {
    return sendNotificationsMessage('checkIfRead', {
      userId: user._id,
      itemId: ticket._id
    }, true, true);
  },

  labels(ticket: ITicketDocument, _args, { models: { PipelineLabels } }: IContext) {
    return PipelineLabels.find({ _id: { $in: ticket.labelIds || [] } });
  },

  createdUser(ticket: ITicketDocument) {
    return { __typename: "User", _id: ticket.userId };
  }
};