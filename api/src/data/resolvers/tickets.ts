import {
  Companies,
  Conformities,
  Customers,
  Notifications,
  PipelineLabels,
  Pipelines,
  Stages
} from '../../db/models';
import { ITicketDocument } from '../../db/models/definitions/tickets';
import { IContext } from '../types';
import { boardId } from './boardUtils';
import { getDocument, getDocumentList } from './mutations/cacheUtils';

export default {
  async companies(ticket: ITicketDocument) {
    const companyIds = await Conformities.savedConformity({
      mainType: 'ticket',
      mainTypeId: ticket._id,
      relTypes: ['company']
    });

    return Companies.findActiveCompanies({ _id: { $in: companyIds || [] } });
  },

  async customers(ticket: ITicketDocument) {
    const customerIds = await Conformities.savedConformity({
      mainType: 'ticket',
      mainTypeId: ticket._id,
      relTypes: ['customer']
    });

    return Customers.findActiveCustomers({ _id: { $in: customerIds || [] } });
  },

  assignedUsers(ticket: ITicketDocument) {
    return getDocumentList('users', {
      _id: { $in: ticket.assignedUserIds || [] }
    });
  },

  async pipeline(ticket: ITicketDocument) {
    const stage = await Stages.getStage(ticket.stageId);

    return Pipelines.findOne({ _id: stage.pipelineId });
  },

  boardId(ticket: ITicketDocument) {
    return boardId(ticket);
  },

  stage(ticket: ITicketDocument) {
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
    return Notifications.checkIfRead(user._id, ticket._id);
  },

  labels(ticket: ITicketDocument) {
    return PipelineLabels.find({ _id: { $in: ticket.labelIds || [] } });
  },

  createdUser(ticket: ITicketDocument) {
    return getDocument('users', { _id: ticket.userId });
  }
};
