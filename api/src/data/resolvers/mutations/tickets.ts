import { Tickets } from '../../../db/models';
import { IItemDragCommonFields } from '../../../db/models/definitions/boards';
import { ITicket } from '../../../db/models/definitions/tickets';
import { checkPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { itemsAdd, itemsArchive, itemsChange, itemsCopy, itemsEdit, itemsRemove } from './boardUtils';

interface ITicketsEdit extends ITicket {
  _id: string;
}

const ticketMutations = {
  /**
   * Create new ticket
   */
  async ticketsAdd(_root, doc: ITicket & { proccessId: string; aboveItemId: string }, { user, docModifier }: IContext) {
    return itemsAdd(doc, 'ticket', user, docModifier, Tickets.createTicket);
  },

  /**
   * Edit ticket
   */
  async ticketsEdit(_root, { _id, proccessId, ...doc }: ITicketsEdit & { proccessId: string }, { user }: IContext) {
    const oldTicket = await Tickets.getTicket(_id);

    return itemsEdit(_id, 'ticket', oldTicket, doc, proccessId, user, Tickets.updateTicket);
  },

  /**
   * Change ticket
   */
  async ticketsChange(_root, doc: IItemDragCommonFields, { user }: IContext) {
    return itemsChange(doc, 'ticket', user, Tickets.updateTicket);
  },

  /**
   * Remove ticket
   */
  async ticketsRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    return itemsRemove(_id, 'ticket', user);
  },

  /**
   * Watch ticket
   */
  async ticketsWatch(_root, { _id, isAdd }: { _id: string; isAdd: boolean }, { user }: IContext) {
    return Tickets.watchTicket(_id, isAdd, user._id);
  },

  async ticketsCopy(_root, { _id, proccessId }: { _id: string; proccessId: string }, { user }: IContext) {
    return itemsCopy(_id, proccessId, 'ticket', user, ['source'], Tickets.createTicket);
  },

  async ticketsArchive(_root, { stageId, proccessId }: { stageId: string; proccessId: string }, { user }: IContext) {
    return itemsArchive(stageId, 'ticket', proccessId, user);
  },
};

checkPermission(ticketMutations, 'ticketsAdd', 'ticketsAdd');
checkPermission(ticketMutations, 'ticketsEdit', 'ticketsEdit');
checkPermission(ticketMutations, 'ticketsRemove', 'ticketsRemove');
checkPermission(ticketMutations, 'ticketsWatch', 'ticketsWatch');
checkPermission(ticketMutations, 'ticketsArchive', 'ticketsArchive');

export default ticketMutations;
