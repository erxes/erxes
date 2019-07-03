import { Tickets } from '../../../db/models';
import { IOrderInput } from '../../../db/models/definitions/boards';
import { NOTIFICATION_TYPES } from '../../../db/models/definitions/constants';
import { ITicket } from '../../../db/models/definitions/tickets';
import { IUserDocument } from '../../../db/models/definitions/users';
import { checkPermission } from '../../permissions/wrappers';
import { itemsChange, manageNotifications, sendNotifications } from '../boardUtils';

interface ITicketsEdit extends ITicket {
  _id: string;
}

const ticketMutations = {
  /**
   * Create new ticket
   */
  async ticketsAdd(_root, doc: ITicket, { user }: { user: IUserDocument }) {
    const ticket = await Tickets.createTicket({
      ...doc,
      modifiedBy: user._id,
    });

    await sendNotifications(
      ticket.stageId || '',
      user,
      NOTIFICATION_TYPES.TICKET_ADD,
      ticket.assignedUserIds || [],
      `'{userName}' invited you to the '${ticket.name}'.`,
      'ticket',
    );

    return ticket;
  },

  /**
   * Edit ticket
   */
  async ticketsEdit(_root, { _id, ...doc }: ITicketsEdit, { user }) {
    const ticket = await Tickets.updateTicket(_id, {
      ...doc,
      modifiedAt: new Date(),
      modifiedBy: user._id,
    });

    await manageNotifications(Tickets, ticket, user, 'ticket');

    return ticket;
  },

  /**
   * Change ticket
   */
  async ticketsChange(
    _root,
    { _id, destinationStageId }: { _id: string; destinationStageId: string },
    { user }: { user: IUserDocument },
  ) {
    const ticket = await Tickets.updateTicket(_id, {
      modifiedAt: new Date(),
      modifiedBy: user._id,
      stageId: destinationStageId,
    });

    const content = await itemsChange(Tickets, ticket, 'ticket', destinationStageId);

    await sendNotifications(
      ticket.stageId || '',
      user,
      NOTIFICATION_TYPES.TICKET_CHANGE,
      ticket.assignedUserIds || [],
      content,
      'ticket',
    );

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
  async ticketsRemove(_root, { _id }: { _id: string }, { user }: { user: IUserDocument }) {
    const ticket = await Tickets.findOne({ _id });

    if (!ticket) {
      throw new Error('ticket not found');
    }

    await sendNotifications(
      ticket.stageId || '',
      user,
      NOTIFICATION_TYPES.TICKET_DELETE,
      ticket.assignedUserIds || [],
      `'{userName}' deleted ticket: '${ticket.name}'`,
      'ticket',
    );

    return Tickets.removeTicket(_id);
  },
};

checkPermission(ticketMutations, 'ticketsAdd', 'ticketsAdd');
checkPermission(ticketMutations, 'ticketsEdit', 'ticketsEdit');
checkPermission(ticketMutations, 'ticketsUpdateOrder', 'ticketsUpdateOrder');
checkPermission(ticketMutations, 'ticketsRemove', 'ticketsRemove');

export default ticketMutations;
