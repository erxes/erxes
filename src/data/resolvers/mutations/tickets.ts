import { ActivityLogs, Checklists, Conformities, Tickets } from '../../../db/models';
import { getCompanies, getCustomers } from '../../../db/models/boardUtils';
import { IOrderInput } from '../../../db/models/definitions/boards';
import { NOTIFICATION_TYPES } from '../../../db/models/definitions/constants';
import { ITicket } from '../../../db/models/definitions/tickets';
import { MODULE_NAMES } from '../../constants';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../logUtils';
import { checkPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { checkUserIds } from '../../utils';
import {
  copyChecklists,
  copyPipelineLabels,
  createConformity,
  IBoardNotificationParams,
  itemsChange,
  prepareBoardItemDoc,
  sendNotifications,
} from '../boardUtils';

interface ITicketsEdit extends ITicket {
  _id: string;
}

const ticketMutations = {
  /**
   * Create new ticket
   */
  async ticketsAdd(_root, doc: ITicket, { user, docModifier }: IContext) {
    doc.watchedUserIds = [user._id];

    const extendedDoc = {
      ...docModifier(doc),
      modifiedBy: user._id,
      userId: user._id,
    };

    const ticket = await Tickets.createTicket(extendedDoc);

    await createConformity({
      mainType: MODULE_NAMES.TICKET,
      mainTypeId: ticket._id,
      customerIds: doc.customerIds,
      companyIds: doc.companyIds,
    });

    await sendNotifications({
      item: ticket,
      user,
      type: NOTIFICATION_TYPES.TICKET_ADD,
      action: `invited you to the`,
      content: `'${ticket.name}'.`,
      contentType: MODULE_NAMES.TICKET,
    });

    await putCreateLog(
      {
        type: MODULE_NAMES.TICKET,
        newData: {
          ...extendedDoc,
          order: ticket.order,
          createdAt: ticket.createdAt,
          modifiedAt: ticket.modifiedAt,
        },
        object: ticket,
      },
      user,
    );

    return ticket;
  },

  /**
   * Edit ticket
   */
  async ticketsEdit(_root, { _id, ...doc }: ITicketsEdit, { user }: IContext) {
    const oldTicket = await Tickets.getTicket(_id);

    const extendedDoc = {
      ...doc,
      modifiedAt: new Date(),
      modifiedBy: user._id,
    };

    const updatedTicket = await Tickets.updateTicket(_id, extendedDoc);

    await copyPipelineLabels({ item: oldTicket, doc, user });

    const notificationDoc: IBoardNotificationParams = {
      item: updatedTicket,
      user,
      type: NOTIFICATION_TYPES.TICKET_EDIT,
      contentType: MODULE_NAMES.TICKET,
    };

    if (doc.assignedUserIds) {
      const { addedUserIds, removedUserIds } = checkUserIds(oldTicket.assignedUserIds, doc.assignedUserIds);

      notificationDoc.invitedUsers = addedUserIds;
      notificationDoc.removedUsers = removedUserIds;
    }

    await sendNotifications(notificationDoc);

    await putUpdateLog(
      {
        type: MODULE_NAMES.TICKET,
        object: oldTicket,
        newData: extendedDoc,
        updatedDocument: updatedTicket,
      },
      user,
    );

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

    const { content, action } = await itemsChange(user._id, ticket, MODULE_NAMES.TICKET, destinationStageId);

    await sendNotifications({
      item: ticket,
      user,
      type: NOTIFICATION_TYPES.TICKET_CHANGE,
      action,
      content,
      contentType: MODULE_NAMES.TICKET,
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
    const ticket = await Tickets.getTicket(_id);

    await sendNotifications({
      item: ticket,
      user,
      type: NOTIFICATION_TYPES.TICKET_DELETE,
      action: `deleted ticket:`,
      content: `'${ticket.name}'`,
      contentType: MODULE_NAMES.TICKET,
    });

    await Conformities.removeConformity({ mainType: MODULE_NAMES.TICKET, mainTypeId: ticket._id });
    await Checklists.removeChecklists(MODULE_NAMES.TICKET, ticket._id);
    await ActivityLogs.removeActivityLog(ticket._id);

    const removed = await ticket.remove();

    await putDeleteLog({ type: MODULE_NAMES.TICKET, object: ticket }, user);

    return removed;
  },

  /**
   * Watch ticket
   */
  async ticketsWatch(_root, { _id, isAdd }: { _id: string; isAdd: boolean }, { user }: IContext) {
    return Tickets.watchTicket(_id, isAdd, user._id);
  },

  async ticketsCopy(_root, { _id }: { _id: string }, { user }: IContext) {
    const ticket = await Tickets.getTicket(_id);

    const doc = await prepareBoardItemDoc(_id, 'ticket', user._id);

    doc.source = ticket.source;

    const clone = await Tickets.createTicket(doc);

    const companies = await getCompanies('ticket', _id);
    const customers = await getCustomers('ticket', _id);

    await createConformity({
      mainType: 'ticket',
      mainTypeId: clone._id,
      customerIds: customers.map(c => c._id),
      companyIds: companies.map(c => c._id),
    });
    await copyChecklists({
      contentType: 'ticket',
      contentTypeId: ticket._id,
      targetContentId: clone._id,
      user,
    });

    return clone;
  },
};

checkPermission(ticketMutations, 'ticketsAdd', 'ticketsAdd');
checkPermission(ticketMutations, 'ticketsEdit', 'ticketsEdit');
checkPermission(ticketMutations, 'ticketsUpdateOrder', 'ticketsUpdateOrder');
checkPermission(ticketMutations, 'ticketsRemove', 'ticketsRemove');
checkPermission(ticketMutations, 'ticketsWatch', 'ticketsWatch');

export default ticketMutations;
