import {
  sendConformityMessage,
  sendContactRPCMessage,
  sendNotificationMessage,
} from '../../../messageBroker';
import { PipelineLabels, Pipelines, Stages } from '../../../models';
import { ITicketDocument } from '../../../models/definitions/tickets';
import { IContext } from '@erxes/api-utils/src';
import { boardId } from '../../utils';

export default {
  async companies(ticket: ITicketDocument) {
    const companyIds = await sendConformityMessage('savedConformity', {
      mainType: 'ticket',
      mainTypeId: ticket._id,
      relTypes: ['company']
    });

    const companies = await sendContactRPCMessage('findActiveCompanies', {
      selector: { _id: { $in: companyIds } }
    });

    return (companies || []).map(({ _id }) => ({ __typename: "Company", _id }));
  },

  async customers(ticket: ITicketDocument) {
    const customerIds = await sendConformityMessage('savedConformity', {
      mainType: 'ticket',
      mainTypeId: ticket._id,
      relTypes: ['customer']
    });

    const customers = await sendContactRPCMessage('findActiveCustomers', {
      selector: { _id: { $in: customerIds } }
    });

    return (customers || []).map(({ _id }) => ({ __typename: "Customer", _id }));
  },

  assignedUsers(ticket: ITicketDocument) {
    return (ticket.assignedUserIds || []).map(_id => ({ __typename: "User", _id }));
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
    return sendNotificationMessage('checkIfRead', {
      userId: user._id,
      itemId: ticket._id
    }, true, true);
  },

  labels(ticket: ITicketDocument) {
    return PipelineLabels.find({ _id: { $in: ticket.labelIds || [] } });
  },

  createdUser(ticket: ITicketDocument) {
    return { __typename: "User", _id: ticket.userId };
  }
};