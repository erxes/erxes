import { Tickets } from '../../../db/models';
import { IOrderInput } from '../../../db/models/definitions/boards';
import { NOTIFICATION_TYPES } from '../../../db/models/definitions/constants';
import { ITicket } from '../../../db/models/definitions/tickets';
import { checkPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { IBoardNotificationParams, itemsChange, sendNotifications } from '../boardUtils';
import { checkUserIds } from './notifications';

interface ITicketsEdit extends ITicket {
  _id: string;
}

const ticketMutations = {
  /**
   * Create new ticket
   */
  async ticketsAdd(_root, doc: ITicket, { user }: IContext) {
    const ticket = await Tickets.createTicket({
      ...doc,
      modifiedBy: user._id,
    });

    await sendNotifications({
      item: ticket,
      user,
      type: NOTIFICATION_TYPES.TICKET_ADD,
      action: `invited you to the`,
      content: `'${ticket.name}'.`,
      contentType: 'ticket',
    });

    return ticket;
  },

  /**
   * Edit ticket
   */
  async ticketsEdit(_root, { _id, ...doc }: ITicketsEdit, { user }: IContext) {
    const oldTicket = await Tickets.findOne({ _id });

    if (!oldTicket) {
      throw new Error('Ticket not found');
    }

    const updatedTicket = await Tickets.updateTicket(_id, {
      ...doc,
      modifiedAt: new Date(),
      modifiedBy: user._id,
    });

    const notificationDoc: IBoardNotificationParams = {
      item: updatedTicket,
      user,
      type: NOTIFICATION_TYPES.TICKET_EDIT,
      contentType: 'ticket',
    };

    if (doc.assignedUserIds) {
      const { addedUserIds, removedUserIds } = checkUserIds(oldTicket.assignedUserIds || [], doc.assignedUserIds);

      notificationDoc.invitedUsers = addedUserIds;
      notificationDoc.removedUsers = removedUserIds;
    }

    await sendNotifications(notificationDoc);

    return updatedTicket;
  },

  /**
   * Change ticket
   */
  async ticketsChange(
    _root,
    { _id, destinationStageId }: { _id: string; destinationStageId: string },
    { user }: IContext,
  ) {
    const ticket = await Tickets.getTicket(_id);

    await Tickets.updateTicket(_id, {
      modifiedAt: new Date(),
      modifiedBy: user._id,
      stageId: destinationStageId,
    });

    const { content, action } = await itemsChange(ticket, 'ticket', destinationStageId);

    await sendNotifications({
      item: ticket,
      user,
      type: NOTIFICATION_TYPES.TICKET_CHANGE,
      action,
      content,
      contentType: 'ticket',
    });

    return ticket;
  },

  /**
   * Update ticket orders (not sendNotifaction, ordered card to change)
   */
  ticketsUpdateOrder(_root, { stageId, orders }: { stageId: string; orders: IOrderInput[] }) {
    return Tickets.updateOrder(stageId, orders);
  },

  /**
   * Remove ticket
   */
  async ticketsRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    const ticket = await Tickets.findOne({ _id });

    if (!ticket) {
      throw new Error('ticket not found');
    }

    await sendNotifications({
      item: ticket,
      user,
      type: NOTIFICATION_TYPES.TICKET_DELETE,
      action: `deleted ticket:`,
      content: `'${ticket.name}'`,
      contentType: 'ticket',
    });

    return ticket.remove();
  },

  /**
   * Watch ticket
   */
  async ticketsWatch(_root, { _id, isAdd }: { _id: string; isAdd: boolean }, { user }: IContext) {
    const ticket = await Tickets.findOne({ _id });

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    return Tickets.watchTicket(_id, isAdd, user._id);
  },
};

checkPermission(ticketMutations, 'ticketsAdd', 'ticketsAdd');
checkPermission(ticketMutations, 'ticketsEdit', 'ticketsEdit');
checkPermission(ticketMutations, 'ticketsUpdateOrder', 'ticketsUpdateOrder');
checkPermission(ticketMutations, 'ticketsRemove', 'ticketsRemove');
checkPermission(ticketMutations, 'ticketsWatch', 'ticketsWatch');

export default ticketMutations;
