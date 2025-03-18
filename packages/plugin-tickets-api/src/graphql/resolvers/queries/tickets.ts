import {
  checkPermission,
  moduleRequireLogin
} from "@erxes/api-utils/src/permissions";
import { IContext } from "../../../connectionResolver";
import { IListParams } from "./boards";
import {
  archivedItems,
  archivedItemsCount,
  checkItemPermByUser,
  generateTicketCommonFilters,
  getItemList,
  IArchiveArgs
} from "./utils";
import { sendCoreMessage } from "../../../messageBroker";
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

    return await getItemList(models, subdomain, filter, args, user, "ticket");
  },

  async ticketsTotalCount(
    _root,
    args: IListParams,
    { user, models, subdomain }: IContext
  ) {
    const filter = {
      ...(await generateTicketCommonFilters(models, subdomain, user._id, args))
    };

    return models.Tickets.find(filter).countDocuments();
  },

  /**
   * Archived list
   */
  async archivedTickets(_root, args: IArchiveArgs, { models }: IContext) {
    return archivedItems(models, args, models.Tickets);
  },

  async archivedTicketsCount(_root, args: IArchiveArgs, { models }: IContext) {
    return archivedItemsCount(models, args, models.Tickets);
  },

  /**
   * Tickets detail
   */
  async ticketDetail(
    _root,
    { _id }: { _id: string },
    { user, models, subdomain }: IContext
  ) {
    const ticket = await models.Tickets.getTicket(_id);

    return checkItemPermByUser(subdomain, models, user, ticket);
  },
  async ticketCheckProgress(
    _root,
    { number }: { number: string },
    { user, models, subdomain }: IContext
  ) {
    const ticket = await models.Tickets.findOne({
      number: number
    });

    if (!ticket) {
      throw new Error("Ticket not found");
    }
    return await checkItemPermByUser(subdomain, models, user, ticket);
  },

  async ticketCheckProgressForget(
    _root,
    { email, phoneNumber }: { email: string; phoneNumber: string },
    { user, models, subdomain }: IContext
  ) {
    let users;

    if (email) {
      users = await sendCoreMessage({
        subdomain,
        action: "users.findOne",
        data: { email },
        isRPC: true,
        defaultValue: null
      });
    } else if (phoneNumber) {
      users = await sendCoreMessage({
        subdomain,
        action: "users.findOne",
        data: { "details.operatorPhone": phoneNumber },
        isRPC: true,
        defaultValue: null
      });
    }

    if (!users || !users._id) {
      throw new Error("User not found");
    }
    console.log(users,'users')
    const tickets = await models.Tickets.find({
      userId: users._id,
      number: { $exists: true, $ne: null }
    });
    if (!tickets.length) {
      return null;
    }

    // Get the most recent ticket based on createdAt
    const formattedTickets = tickets.map((ticket) => ({
      userId: ticket.userId,
      name: ticket.name,
      stageId: ticket.stageId,
      number: ticket.number,
      type: ticket.type
    }));

    return formattedTickets;
  }
};

moduleRequireLogin(ticketQueries);

checkPermission(ticketQueries, "tickets", "showTickets", []);

export default ticketQueries;
