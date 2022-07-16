import {
  checkPermission,
  moduleRequireLogin
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { IListParams } from './boards';
import {
  archivedItems,
  archivedItemsCount,
  checkItemPermByUser,
  generateTicketCommonFilters,
  getItemList,
  IArchiveArgs
} from './utils';

const ticketQueries = {
  /**
   * Tickets list
   */
  async tickets(
    _root,
    args: IListParams,
    { user, models, subdomain }: IContext
  ) {
    const filter = {
      ...(await generateTicketCommonFilters(models, subdomain, user._id, args))
    };

    return await getItemList(models, subdomain, filter, args, user, 'ticket');
  },

  async ticketsTotalCount(
    _root,
    args: IListParams,
    { user, models, subdomain }: IContext
  ) {
    const filter = {
      ...(await generateTicketCommonFilters(models, subdomain, user._id, args))
    };

    return models.Tickets.find(filter).count();
  },

  /**
   * Archived list
   */
  archivedTickets(_root, args: IArchiveArgs, { models }: IContext) {
    return archivedItems(models, args, models.Tickets);
  },

  archivedTicketsCount(_root, args: IArchiveArgs, { models }: IContext) {
    return archivedItemsCount(models, args, models.Tickets);
  },

  /**
   * Tickets detail
   */
  async ticketDetail(
    _root,
    { _id }: { _id: string },
    { user, models }: IContext
  ) {
    const ticket = await models.Tickets.getTicket(_id);

    return checkItemPermByUser(models, user._id, ticket);
  }
};

moduleRequireLogin(ticketQueries);

checkPermission(ticketQueries, 'tickets', 'showTickets', []);

export default ticketQueries;
