import { IItemDragCommonFields } from '../../../models/definitions/boards';
import { ITicket } from '../../../models/definitions/tickets';
import { checkPermission } from '@erxes/api-utils/src/permissions';
import {
  itemsAdd,
  itemsArchive,
  itemsChange,
  itemsCopy,
  itemsEdit,
  itemsRemove
} from './utils';
import { IContext } from '../../../connectionResolver';

interface ITicketsEdit extends ITicket {
  _id: string;
}

const ticketMutations = {
  /**
   * Create new ticket
   */
  async ticketsAdd(
    _root,
    doc: ITicket & { proccessId: string; aboveItemId: string },
    { user, models, subdomain }: IContext
  ) {
    return itemsAdd(
      models,
      subdomain,
      doc,
      'ticket',
      models.Tickets.createTicket,
      user
    );
  },

  /**
   * Edit ticket
   */
  async ticketsEdit(
    _root,
    { _id, proccessId, ...doc }: ITicketsEdit & { proccessId: string },
    { user, models, subdomain }: IContext
  ) {
    const oldTicket = await models.Tickets.getTicket(_id);

    return itemsEdit(
      models,
      subdomain,
      _id,
      'ticket',
      oldTicket,
      doc,
      proccessId,
      user,
      models.Tickets.updateTicket
    );
  },

  /**
   * Change ticket
   */
  async ticketsChange(
    _root,
    doc: IItemDragCommonFields,
    { user, models, subdomain }: IContext
  ) {
    return itemsChange(
      models,
      subdomain,
      doc,
      'ticket',
      user,
      models.Tickets.updateTicket
    );
  },

  /**
   * Remove ticket
   */
  async ticketsRemove(
    _root,
    { _id }: { _id: string },
    { user, models, subdomain }: IContext
  ) {
    return itemsRemove(models, subdomain, _id, 'ticket', user);
  },

  /**
   * Watch ticket
   */
  async ticketsWatch(
    _root,
    { _id, isAdd }: { _id: string; isAdd: boolean },
    { user, models }: IContext
  ) {
    return models.Tickets.watchTicket(_id, isAdd, user._id);
  },

  async ticketsCopy(
    _root,
    { _id, proccessId }: { _id: string; proccessId: string },
    { user, models, subdomain }: IContext
  ) {
    return itemsCopy(
      models,
      subdomain,
      _id,
      proccessId,
      'ticket',
      user,
      ['source'],
      models.Tickets.createTicket
    );
  },

  async ticketsArchive(
    _root,
    { stageId, proccessId }: { stageId: string; proccessId: string },
    { user, models, subdomain }: IContext
  ) {
    return itemsArchive(models, subdomain, stageId, 'ticket', proccessId, user);
  }
};

checkPermission(ticketMutations, 'ticketsAdd', 'ticketsAdd');
checkPermission(ticketMutations, 'ticketsEdit', 'ticketsEdit');
checkPermission(ticketMutations, 'ticketsRemove', 'ticketsRemove');
checkPermission(ticketMutations, 'ticketsWatch', 'ticketsWatch');
checkPermission(ticketMutations, 'ticketsArchive', 'ticketsArchive');

export default ticketMutations;
