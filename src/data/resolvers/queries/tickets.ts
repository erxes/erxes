import { Tickets } from '../../../db/models';
import { checkPermission, moduleRequireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { IListParams } from './boards';
import { checkItemPermByUser, generateTicketCommonFilters } from './boardUtils';

const ticketQueries = {
  /**
   * Tickets list
   */
  async tickets(_root, args: IListParams, { user }: IContext) {
    const filter = await generateTicketCommonFilters(user._id, args);
    const sort = { order: 1, createdAt: -1 };

    return Tickets.find(filter)
      .sort(sort)
      .skip(args.skip || 0)
      .limit(10);
  },

  /**
   * Tickets detail
   */
  async ticketDetail(_root, { _id }: { _id: string }, { user }: IContext) {
    const ticket = await Tickets.getTicket(_id);

    return checkItemPermByUser(user._id, ticket);
  },
};

moduleRequireLogin(ticketQueries);

checkPermission(ticketQueries, 'tickets', 'showTickets', []);

export default ticketQueries;
