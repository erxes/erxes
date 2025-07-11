import { checkUserIds } from "@erxes/api-utils/src";
import graphqlPubsub from "@erxes/api-utils/src/graphqlPubsub";
import { checkPermission } from "@erxes/api-utils/src/permissions";
import { IContext } from "../../../connectionResolver";
import { IItemDragCommonFields } from "../../../models/definitions/boards";
import { IDeal, IProductData } from "../../../models/definitions/deals";
import {
  checkAssignedUserFromPData,
  checkPricing,
  confirmLoyalties,
  doScoreCampaign,
  itemResolver,
  itemsAdd,
  itemsArchive,
  itemsChange,
  itemsCopy,
  itemsEdit,
  itemsRemove,
} from "./utils";
import { putActivityLog } from "../../../logUtils";

interface IDealsEdit extends IDeal {
  _id: string;
}

const dealMutations = {
  /**
   * Creates a new deal
   */
  async dealsAdd(
    _root,
    doc: IDeal & { proccessId: string; aboveItemId: string },
    { user, models, subdomain }: IContext
  ) {
    return itemsAdd(
      models,
      subdomain,
      doc,
      "deal",
      models.Deals.createDeal,
      user
    );
  },

  /**
   * Edits a deal
   */
  async dealsEdit(
    _root,
    { _id, proccessId, ...doc }: IDealsEdit & { proccessId: string },
    { user, models, subdomain }: IContext
  ) {
    const oldDeal = await models.Deals.getDeal(_id);

    if (doc.assignedUserIds) {
      const { removedUserIds } = checkUserIds(
        oldDeal.assignedUserIds,
        doc.assignedUserIds
      );
      const oldAssignedUserPdata = (oldDeal.productsData || [])
        .filter((pdata) => pdata.assignUserId)
        .map((pdata) => pdata.assignUserId || "");
      const cantRemoveUserIds = removedUserIds.filter((userId) =>
        oldAssignedUserPdata.includes(userId)
      );

      if (cantRemoveUserIds.length > 0) {
        throw new Error(
          "Cannot remove the team member, it is assigned in the product / service section"
        );
      }
    }

    if (doc.productsData) {
      const { assignedUserIds } = checkAssignedUserFromPData(
        oldDeal.assignedUserIds,
        doc.productsData
          .filter((pdata) => pdata.assignUserId)
          .map((pdata) => pdata.assignUserId || ""),
        oldDeal.productsData
      );

      doc.assignedUserIds = assignedUserIds;

      doc.productsData = await checkPricing(subdomain, models, { ...oldDeal, ...doc })
    }

    await doScoreCampaign(subdomain, models, _id, doc);
    await confirmLoyalties(subdomain, _id, doc);

    return itemsEdit(
      models,
      subdomain,
      _id,
      "deal",
      oldDeal,
      doc,
      proccessId,
      user,
      models.Deals.updateDeal
    );
  },

  /**
   * Change deal
   */
  async dealsChange(
    _root,
    doc: IItemDragCommonFields,
    { user, models, subdomain }: IContext
  ) {
    return itemsChange(
      models,
      subdomain,
      doc,
      "deal",
      user,
      models.Deals.updateDeal
    );
  },

  /**
   * Remove deal
   */
  async dealsRemove(
    _root,
    { _id }: { _id: string },
    { user, models, subdomain }: IContext
  ) {
    return itemsRemove(models, subdomain, _id, "deal", user);
  },

  /**
   * Watch deal
   */
  async dealsWatch(
    _root,
    { _id, isAdd }: { _id: string; isAdd: boolean },
    { user, models }: IContext
  ) {
    return models.Deals.watchDeal(_id, isAdd, user._id);
  },

  async dealsCopy(
    _root,
    { _id, proccessId }: { _id: string; proccessId: string },
    { user, models, subdomain }: IContext
  ) {
    return itemsCopy(
      models,
      subdomain,
      _id,
      proccessId,
      "deal",
      user,
      ["productsData", "paymentsData"],
      models.Deals.createDeal
    );
  },

  async dealsArchive(
    _root,
    { stageId, proccessId }: { stageId: string; proccessId: string },
    { user, models, subdomain }: IContext
  ) {
    return itemsArchive(models, subdomain, stageId, "deal", proccessId, user);
  },

  async dealsCreateProductsData(
    _root,
    {
      proccessId,
      dealId,
      docs,
    }: {
      proccessId: string;
      dealId: string;
      docs: IProductData[];
    },
    { models, subdomain, user }: IContext
  ) {
    const deal = await models.Deals.getDeal(dealId);
    const stage = await models.Stages.getStage(deal.stageId);

    const oldDataIds = (deal.productsData || []).map((pd) => pd._id);

    const { assignedUserIds, addedUserIds, removedUserIds } = checkAssignedUserFromPData(
      deal.assignedUserIds,
      [
        ...(deal.productsData || [])
          .filter((pdata) => pdata.assignUserId)
          .map((pdata) => pdata.assignUserId || ""),
        ...docs
          .filter((pdata) => pdata.assignUserId)
          .map((pdata) => pdata.assignUserId || ""),
      ],
      deal.productsData
    );

    for (const doc of docs) {
      if (doc._id) {
        const checkDup = (deal.productsData || []).find(
          (pd) => pd._id === doc._id
        );
        if (checkDup) {
          throw new Error("Deals productData duplicated");
        }
      }
    }

    // undefenid or null then true
    const tickUsed = stage.defaultTick === false ? false : true;
    const addDocs = (docs || []).map(
      (doc) => ({ ...doc, tickUsed }) as IProductData
    );
    const productsData: IProductData[] = (deal.productsData || []).concat(
      addDocs
    );

    await models.Deals.updateOne({ _id: dealId }, { $set: { productsData, assignedUserIds } });

    if (addedUserIds?.length || removedUserIds?.length) {
      const activityContent = { addedUserIds, removedUserIds };

      putActivityLog(subdomain, {
        action: "createAssigneLog",
        data: {
          contentId: deal._id,
          userId: user._id,
          contentType: 'deal',
          content: activityContent,
          action: "assignee",
          createdBy: user._id,
        },
      });
    }

    const updatedItem =
      (await models.Deals.findOne({ _id: dealId })) || ({} as any);

    graphqlPubsub.publish(`salesPipelinesChanged:${stage.pipelineId}`, {
      salesPipelinesChanged: {
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
              "deal",
              updatedItem
            )),
          },
        },
      },
    });

    const dataIds = (updatedItem.productsData || [])
      .filter((pd) => !oldDataIds.includes(pd._id))
      .map((pd) => pd._id);

    graphqlPubsub.publish(`salesProductsDataChanged:${dealId}`, {
      salesProductsDataChanged: {
        _id: dealId,
        proccessId,
        action: "create",
        data: {
          dataIds,
          docs,
          productsData,
        },
      },
    });

    return {
      dataIds,
      productsData,
    };
  },

  async dealsEditProductData(
    _root,
    {
      proccessId,
      dealId,
      dataId,
      doc,
    }: {
      proccessId: string;
      dealId: string;
      dataId: string;
      doc: IProductData;
    },
    { models, subdomain, user }: IContext
  ) {
    const deal = await models.Deals.getDeal(dealId);
    const oldPData = (deal.productsData || []).find(
      (pdata) => pdata.id === dataId
    );

    if (!oldPData) {
      throw new Error("Deals productData not found");
    }

    const productsData = (deal.productsData || []).map((data) =>
      data.id === dataId ? { ...doc } : data
    );

    const possibleAssignedUsersIds: string[] = (deal.productsData || [])
      .filter((pdata) => pdata._id !== dataId && pdata.assignUserId)
      .map((pdata) => pdata.assignUserId || "");

    if (doc.assignUserId) {
      possibleAssignedUsersIds.push(doc.assignUserId)
    }

    const { assignedUserIds, addedUserIds, removedUserIds } = checkAssignedUserFromPData(
      deal.assignedUserIds,
      possibleAssignedUsersIds,
      deal.productsData
    );

    await models.Deals.updateOne({ _id: dealId }, { $set: { productsData, assignedUserIds } });

    if (addedUserIds?.length || removedUserIds?.length) {
      const activityContent = { addedUserIds, removedUserIds };

      putActivityLog(subdomain, {
        action: "createAssigneLog",
        data: {
          contentId: deal._id,
          userId: user._id,
          contentType: 'deal',
          content: activityContent,
          action: "assignee",
          createdBy: user._id,
        },
      });
    }

    const stage = await models.Stages.getStage(deal.stageId);
    const updatedItem =
      (await models.Deals.findOne({ _id: dealId })) || ({} as any);

    graphqlPubsub.publish(`salesPipelinesChanged:${stage.pipelineId}`, {
      salesPipelinesChanged: {
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
              "deal",
              updatedItem
            )),
          },
        },
      },
    });

    graphqlPubsub.publish(`salesProductsDataChanged:${dealId}`, {
      salesProductsDataChanged: {
        _id: dealId,
        proccessId,
        action: "edit",
        data: {
          dataId,
          doc,
          productsData,
        },
      },
    });

    return {
      dataId,
      productsData,
    };
  },

  async dealsDeleteProductData(
    _root,
    {
      proccessId,
      dealId,
      dataId,
    }: {
      proccessId: string;
      dealId: string;
      dataId: string;
    },
    { models, subdomain, user }: IContext
  ) {
    const deal = await models.Deals.getDeal(dealId);

    const oldPData = (deal.productsData || []).find(
      (pdata) => pdata.id === dataId
    );

    if (!oldPData) {
      throw new Error("Deals productData not found");
    }

    const productsData = (deal.productsData || []).filter(
      (data) => data.id !== dataId
    );

    await models.Deals.updateOne({ _id: dealId }, { $set: { productsData } });

    const stage = await models.Stages.getStage(deal.stageId);
    const updatedItem =
      (await models.Deals.findOne({ _id: dealId })) || ({} as any);

    graphqlPubsub.publish(`salesPipelinesChanged:${stage.pipelineId}`, {
      salesPipelinesChanged: {
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
              "deal",
              updatedItem
            )),
          },
        },
      },
    });

    graphqlPubsub.publish(`salesProductsDataChanged:${dealId}`, {
      salesProductsDataChanged: {
        _id: dealId,
        proccessId,
        action: "delete",
        data: {
          dataId,
          productsData,
        },
      },
    });

    return {
      dataId,
      productsData,
    };
  },
};

checkPermission(dealMutations, "dealsAdd", "dealsAdd");
checkPermission(dealMutations, "dealsEdit", "dealsEdit");
checkPermission(dealMutations, "dealsCreateProductsData", "dealsEdit");
checkPermission(dealMutations, "dealsEditProductData", "dealsEdit");
checkPermission(dealMutations, "dealsDeleteProductData", "dealsEdit");
checkPermission(dealMutations, "dealsRemove", "dealsRemove");
checkPermission(dealMutations, "dealsWatch", "dealsWatch");
checkPermission(dealMutations, "dealsArchive", "dealsArchive");

export default dealMutations;
