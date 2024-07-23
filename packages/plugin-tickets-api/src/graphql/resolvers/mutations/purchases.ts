import * as _ from "underscore";
import { nanoid } from "nanoid";
import { IItemDragCommonFields } from "../../../models/definitions/boards";
import {
  ITicket,
  IProductTicketData
} from "../../../models/definitions/tickets";
import { IExpense } from "../../../models/definitions/expenses";
import { checkPermission } from "@erxes/api-utils/src/permissions";
import { checkUserIds } from "@erxes/api-utils/src";
import {
  itemResolver,
  itemsAdd,
  itemsArchive,
  itemsChange,
  itemsCopy,
  itemsEdit,
  itemsRemove
} from "./utils";
import { IContext } from "../../../connectionResolver";
import graphqlPubsub from "@erxes/api-utils/src/graphqlPubsub";
import { EXPENSE_DIVIDE_TYPES } from "../../../models/definitions/constants";

interface ITicketEdit extends ITicket {
  _id: string;
}

const ticketMutations = {
  /**
   * Edit, Add , Delete expense mutation
   */

  async manageExpenses(
    _root,
    doc: { expenseDocs: IExpense[] },
    { user, models }: IContext
  ) {
    await models.Expenses.updateMany({}, { $set: { status: "deleted" } });

    let bulkOps: Array<{
      updateOne: {
        filter: any;
        update: any;
        upsert?: boolean;
      };
    }> = [];

    const updatedIds: string[] = [];
    for (const expenseDoc of doc.expenseDocs) {
      bulkOps.push({
        updateOne: {
          filter: { $or: [{ _id: expenseDoc._id }, { name: expenseDoc.name }] },
          update: {
            $set: {
              name: expenseDoc.name,
              description: expenseDoc.description,
              status: "active"
            },
            $setOnInsert: {
              _id: nanoid(),
              createdBy: user._id,
              createdAt: new Date()
            }
          },
          upsert: true
        }
      });
    }

    await models.Expenses.bulkWrite(bulkOps);

    return models.Expenses.find({ status: "active" }).lean();
  },

  // create new ticket
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
   * Edits a ticket
   */
  async ticketsEdit(
    _root,
    { _id, proccessId, ...doc }: ITicketEdit & { proccessId: string },
    { user, models, subdomain }: IContext
  ) {
    const oldticket = await models.Tickets.getTicket(_id);

    if (doc.assignedUserIds) {
      const { removedUserIds } = checkUserIds(
        oldticket.assignedUserIds,
        doc.assignedUserIds
      );
      const oldAssignedUserPdata = (oldticket.productsData || [])
        .filter(pdata => pdata.assignUserId)
        .map(pdata => pdata.assignUserId || "");
      const cantRemoveUserIds = removedUserIds.filter(userId =>
        oldAssignedUserPdata.includes(userId)
      );
      if (cantRemoveUserIds.length > 0) {
        throw new Error(
          "Cannot remove the team member, it is assigned in the product / service section"
        );
      }
    }

    if (doc.productsData) {
      const assignedUsersPdata = doc.productsData
        .filter(pdata => pdata.assignUserId)
        .map(pdata => pdata.assignUserId || "");

      const oldAssignedUserPdata = (oldticket.productsData || [])
        .filter(pdata => pdata.assignUserId)
        .map(pdata => pdata.assignUserId || "");

      const { addedUserIds, removedUserIds } = checkUserIds(
        oldAssignedUserPdata,
        assignedUsersPdata
      );

      if (addedUserIds.length > 0 || removedUserIds.length > 0) {
        let assignedUserIds =
          doc.assignedUserIds || oldticket.assignedUserIds || [];
        assignedUserIds = [...new Set(assignedUserIds.concat(addedUserIds))];
        assignedUserIds = assignedUserIds.filter(
          userId => !removedUserIds.includes(userId)
        );
        doc.assignedUserIds = assignedUserIds;
      }
    }

    if (
      doc.expensesData &&
      doc.expensesData.length &&
      doc.productsData &&
      doc.productsData.length
    ) {
      const dataOfQuantity = doc.expensesData.filter(
        ed => ed.type === EXPENSE_DIVIDE_TYPES.QUANTITY
      );
      const dataOfAmount = doc.expensesData.filter(
        ed => ed.type === EXPENSE_DIVIDE_TYPES.AMOUNT
      );

      for (const pdata of doc.productsData) {
        pdata.expenseAmount = 0;
      }

      if (dataOfQuantity.length) {
        const sumOfQuantity = dataOfQuantity
          .map((expense: any) => Number(expense.value))
          .reduce((sum: any, currency: any) => sum + currency, 0);

        const sumQuantity = doc.productsData
          .map((expense: any) => Number(expense.quantity))
          .reduce((sum: any, currency: any) => sum + currency, 0);

        const perExpense = sumOfQuantity / sumQuantity;

        for (const pdata of doc.productsData) {
          pdata.expenseAmount = perExpense * pdata.quantity;
        }
      }
      if (dataOfAmount.length) {
        const sumOfAmount = dataOfAmount
          .map((expense: any) => Number(expense.value))
          .reduce((sum: any, currency: any) => sum + currency, 0);

        const sumAmount = doc.productsData
          .map((expense: any) => expense.amount)
          .reduce((sum: any, currency: any) => sum + currency, 0);

        const perExpense = sumOfAmount / sumAmount;

        for (const pdata of doc.productsData) {
          pdata.expenseAmount =
            (pdata.expenseAmount || 0) + perExpense * (pdata.amount || 0);
        }
      }
    }

    return itemsEdit(
      models,
      subdomain,
      _id,
      "ticket",
      oldticket,
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
      ["productsData", "paymentsData", "expensesData"],
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

  async ticketsCreateProductsData(
    _root,
    {
      proccessId,
      ticketId,
      docs
    }: {
      proccessId: string;
      ticketId: string;
      docs: IProductTicketData[];
    },
    { models, subdomain, user }: IContext
  ) {
    const ticket = await models.Tickets.getTicket(ticketId);
    const oldDataIds = (ticket.productsData || []).map(pd => pd._id);

    for (const doc of docs) {
      if (doc._id) {
        const checkDup = (ticket.productsData || []).find(
          pd => pd._id === doc._id
        );
        if (checkDup) {
          throw new Error("Tickets productData duplicated");
        }
      }
    }

    const productsData = (ticket.productsData || []).concat(docs);
    await models.Tickets.updateOne(
      { _id: ticketId },
      { $set: { productsData } }
    );

    const stage = await models.Stages.getStage(ticket.stageId);
    const updatedItem =
      (await models.Tickets.findOne({ _id: ticketId })) || ({} as any);

    graphqlPubsub.publish(`pipelinesChanged:${stage.pipelineId}`, {
      pipelinesChanged: {
        _id: stage.pipelineId,
        proccessId,
        action: "itemUpdate",
        data: {
          item: {
            ...updatedItem,
            ...(await itemResolver(
              models,
              subdomain,
              user,
              "ticket",
              updatedItem
            ))
          }
        }
      }
    });

    const dataIds = (updatedItem.productsData || [])
      .filter(pd => !oldDataIds.includes(pd._id))
      .map(pd => pd._id);

    graphqlPubsub.publish(`productsDataChanged:${ticketId}`, {
      productsDataChanged: {
        _id: ticketId,
        proccessId,
        action: "create",
        data: {
          dataIds,
          docs,
          productsData
        }
      }
    });

    return {
      dataIds,
      productsData
    };
  },

  async ticketsEditProductData(
    _root,
    {
      proccessId,
      ticketId,
      dataId,
      doc
    }: {
      proccessId: string;
      ticketId: string;
      dataId: string;
      doc: IProductTicketData;
    },
    { models, subdomain, user }: IContext
  ) {
    const ticket = await models.Tickets.getTicket(ticketId);
    const oldPData = (ticket.productsData || []).find(
      pdata => pdata.id === dataId
    );

    if (!oldPData) {
      throw new Error("tickets productData not found");
    }

    const productsData = (ticket.productsData || []).map(data =>
      data.id === dataId ? { ...doc } : data
    );

    await models.Tickets.updateOne(
      { _id: ticketId },
      { $set: { productsData } }
    );

    const stage = await models.Stages.getStage(ticket.stageId);
    const updatedItem =
      (await models.Tickets.findOne({ _id: ticketId })) || ({} as any);

    graphqlPubsub.publish(`pipelinesChanged:${stage.pipelineId}`, {
      pipelinesChanged: {
        _id: stage.pipelineId,
        proccessId,
        action: "itemUpdate",
        data: {
          item: {
            ...updatedItem,
            ...(await itemResolver(
              models,
              subdomain,
              user,
              "ticket",
              updatedItem
            ))
          }
        }
      }
    });

    graphqlPubsub.publish(`productsDataChanged:${ticketId}`, {
      productsDataChanged: {
        _id: ticketId,
        proccessId,
        action: "edit",
        data: {
          dataId,
          doc,
          productsData
        }
      }
    });

    return {
      dataId,
      productsData
    };
  },

  async ticketsDeleteProductData(
    _root,
    {
      proccessId,
      ticketId,
      dataId
    }: {
      proccessId: string;
      ticketId: string;
      dataId: string;
    },
    { models, subdomain, user }: IContext
  ) {
    const ticket = await models.Tickets.getTicket(ticketId);

    const oldPData = (ticket.productsData || []).find(
      pdata => pdata.id === dataId
    );

    if (!oldPData) {
      throw new Error("tickets productData not found");
    }

    const productsData = (ticket.productsData || []).filter(
      data => data.id !== dataId
    );

    await models.Tickets.updateOne(
      { _id: ticketId },
      { $set: { productsData } }
    );

    const stage = await models.Stages.getStage(ticket.stageId);
    const updatedItem =
      (await models.Tickets.findOne({ _id: ticketId })) || ({} as any);

    graphqlPubsub.publish(`pipelinesChanged:${stage.pipelineId}`, {
      pipelinesChanged: {
        _id: stage.pipelineId,
        proccessId,
        action: "itemUpdate",
        data: {
          item: {
            ...updatedItem,
            ...(await itemResolver(
              models,
              subdomain,
              user,
              "ticket",
              updatedItem
            ))
          }
        }
      }
    });

    graphqlPubsub.publish(`productsDataChanged:${ticketId}`, {
      productsDataChanged: {
        _id: ticketId,
        proccessId,
        action: "delete",
        data: {
          dataId,
          productsData
        }
      }
    });

    return {
      dataId,
      productsData
    };
  }
};

checkPermission(ticketMutations, "ticketsAdd", "ticketsAdd");
checkPermission(ticketMutations, "ticketsEdit", "ticketsEdit");
checkPermission(ticketMutations, "ticketsCreateProductsData", "ticketsEdit");
checkPermission(ticketMutations, "ticketsEditProductData", "ticketsEdit");
checkPermission(ticketMutations, "ticketsDeleteProductData", "ticketsEdit");
checkPermission(ticketMutations, "ticketsRemove", "ticketsRemove");
checkPermission(ticketMutations, "ticketsWatch", "ticketsWatch");
checkPermission(ticketMutations, "ticketsArchive", "ticketsArchive");

export default ticketMutations;
