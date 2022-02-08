import {
  sendConformityMessage,
  sendContactRPCMessage,
  sendNotificationRPCMessage
} from '../../../messageBroker';
import { PipelineLabels, Pipelines, Stages } from '../../../models';
import { ITicketDocument } from '../../../models/definitions/tickets';
import { IContext } from '@erxes/api-utils/src';
import { boardId } from '../../utils';
import { getDocument, getDocumentList } from '../../../cacheUtils';

export default {
  async companies(ticket: ITicketDocument) {
    const companyIds = await sendConformityMessage('savedConformity', {
      mainType: 'ticket',
      mainTypeId: ticket._id,
      relTypes: ['company']
    });

    return sendContactRPCMessage('findActiveCompanies', {
      selector: { _id: { $in: companyIds } }
    });
  },

  async customers(ticket: ITicketDocument) {
    const customerIds = await sendConformityMessage('savedConformity', {
      mainType: 'ticket',
      mainTypeId: ticket._id,
      relTypes: ['customer']
    });

    return sendContactRPCMessage('findActiveCustomers', {
      selector: { _id: { $in: customerIds } }
    });
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
    return sendNotificationRPCMessage('checkIfRead', {
      userId: user._id,
      itemId: ticket._id
    });
  },

  labels(ticket: ITicketDocument) {
    return PipelineLabels.find({ _id: { $in: ticket.labelIds || [] } });
  },

  createdUser(ticket: ITicketDocument) {
    return getDocument('users', { _id: ticket.userId });
  }
};
