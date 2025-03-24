import { IItemDragCommonFields } from "../../../models/definitions/boards";
import { ITicket } from "../../../models/definitions/tickets";
import { checkPermission } from "@erxes/api-utils/src/permissions";
import {
  itemsAdd,
  itemsArchive,
  itemsChange,
  itemsCopy,
  itemsEdit,
  itemsRemove
} from "./utils";
import { IContext } from "../../../connectionResolver";
import { sendCoreMessage } from "../../../messageBroker";
import {checkItemPermByUser} from "../queries/utils"
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
      "ticket",
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
      "ticket",
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
      "ticket",
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
    return itemsRemove(models, subdomain, _id, "ticket", user);
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
      "ticket",
      user,
      ["source"],
      models.Tickets.createTicket
    );
  },

  async ticketsArchive(
    _root,
    { stageId, proccessId }: { stageId: string; proccessId: string },
    { user, models, subdomain }: IContext
  ) {
    return itemsArchive(models, subdomain, stageId, "ticket", proccessId, user);
  },
  async ticketCheckProgress(
    _root,
    { number }: { number: string },
    { user, models, subdomain }: IContext
  ) {
    if(!number ){
      return null

    }
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
    { models, subdomain }: IContext
  ) {
    if(!email && !phoneNumber){
      return null
    }
    let customer;
    if (email) {
      customer = await sendCoreMessage({
        subdomain,
        action: "customers.findOne",
        data: { primaryEmail:email },
        isRPC: true,
        defaultValue: null
      });
    } else if (phoneNumber) {
      customer = await sendCoreMessage({
        subdomain,
        action: "customers.findOne",
        data: {primaryPhone: phoneNumber },
        isRPC: true,
        defaultValue: null
      });
    }
    if (customer) {
      const customerIds = [customer._id]; 
      const mainTypeIds = await sendCoreMessage({
        subdomain,
        action: "conformities.findConformities",
        data: {
          mainType: "ticket",
          relType: 'customer',
          relTypeId:  customerIds,
        },
        isRPC: true,
        defaultValue: []
      });
      
      if (!mainTypeIds.length) {
        return;
      }
      const ticketIds = mainTypeIds.map((mainType) => mainType.mainTypeId);

      const tickets = await models.Tickets.find({
        _id: { $in: ticketIds },
        number: { $exists: true, $ne: null }
      });
      if (!tickets.length) {
        return null;
      }

      const formattedTickets = tickets.map((ticket) => ({
        userId: ticket.userId,
        name: ticket.name,
        stageId: ticket.stageId,
        number: ticket.number,
        type: ticket.type
      }));
  
      return formattedTickets;
   
    } else {
      throw new Error("No user found.");
    }
    
  }
};

checkPermission(ticketMutations, "ticketsAdd", "ticketsAdd");
checkPermission(ticketMutations, "ticketsEdit", "ticketsEdit");
checkPermission(ticketMutations, "ticketsRemove", "ticketsRemove");
checkPermission(ticketMutations, "ticketsWatch", "ticketsWatch");
checkPermission(ticketMutations, "ticketsArchive", "ticketsArchive");

export default ticketMutations;
