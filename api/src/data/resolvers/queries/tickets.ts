import { Tickets } from '../../../db/models';
import {
  checkPermission,
  moduleRequireLogin
} from '../../permissions/wrappers';
import { IContext } from '../../types';
import { IListParams } from './boards';
import {
  archivedItems,
  archivedItemsCount,
  checkItemPermByUser,
  generateTicketCommonFilters,
  getItemList,
  IArchiveArgs
} from './boardUtils';

const ticketQueries = {
  /**
   * Tickets list
   */
  async tickets(
    _root,
    args: IListParams,
    { user, commonQuerySelector }: IContext
  ) {
    const filter = {
      ...commonQuerySelector,
      ...(await generateTicketCommonFilters(user._id, args))
    };

    return await getItemList(filter, args, user, 'ticket');
  },

  /**
   * Archived list
   */
  archivedTickets(_root, args: IArchiveArgs) {
    return archivedItems(args, Tickets);
  },

  archivedTicketsCount(_root, args: IArchiveArgs) {
    return archivedItemsCount(args, Tickets);
  },

  /**
   * Tickets detail
   */
  async ticketDetail(_root, { _id }: { _id: string }, { user }: IContext) {
    const ticket = await Tickets.getTicket(_id);

    return checkItemPermByUser(user._id, ticket);
  }
};

moduleRequireLogin(ticketQueries);

checkPermission(ticketQueries, 'tickets', 'showTickets', []);

export default ticketQueries;
