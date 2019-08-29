import { Companies, Customers, Notifications, Pipelines, Stages, Users } from '../../db/models';
import { ITicketDocument } from '../../db/models/definitions/tickets';
import { IContext } from '../types';
import { boardId } from './boardUtils';

export default {
  companies(ticket: ITicketDocument) {
    return Companies.find({ _id: { $in: ticket.companyIds || [] } });
  },

  customers(ticket: ITicketDocument) {
    return Customers.find({ _id: { $in: ticket.customerIds || [] } });
  },

  assignedUsers(ticket: ITicketDocument) {
    return Users.find({ _id: { $in: ticket.assignedUserIds } });
  },

  async pipeline(ticket: ITicketDocument) {
    const stage = await Stages.findOne({ _id: ticket.stageId });

    if (!stage) {
      return null;
    }

    return Pipelines.findOne({ _id: stage.pipelineId });
  },

  boardId(ticket: ITicketDocument) {
    return boardId(ticket);
  },

  stage(ticket: ITicketDocument) {
    return Stages.findOne({ _id: ticket.stageId });
  },

  isWatched(ticket: ITicketDocument, _args, { user }: IContext) {
    const watchedUserIds = ticket.watchedUserIds || [];

    if (watchedUserIds.includes(user._id)) {
      return true;
    }

    return false;
  },

  hasNotified(deal: ITicketDocument, _args, { user }: IContext) {
    return Notifications.checkIfRead(user._id, deal._id);
  },
};
