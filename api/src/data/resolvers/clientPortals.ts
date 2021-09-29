import { TicketComments, Users, Customers } from '../../db/models';
import {
  ITicketDocument,
  ICommentDocument
} from '../../db/models/definitions/tickets';

export const ticketComments = {
  async comments(ticket: ITicketDocument) {
    return TicketComments.find({ ticketId: ticket._id });
  }
};

export const TicketComment = {
  async profile(comment: ICommentDocument) {
    if (comment.userId) {
      const user = await Users.findOne({ _id: comment.userId });

      if (!user || !user.details) {
        return {};
      }

      return {
        name: user.details.fullName,
        avatar: user.details.avatar
      };
    }

    if (comment.customerId) {
      const customer = await Customers.findOne({ _id: comment.customerId });

      if (!customer) {
        return {};
      }

      return {
        name: `${customer.firstName} ${customer.lastName}`,
        avatar: customer.avatar
      };
    }

    return {};
  }
};
