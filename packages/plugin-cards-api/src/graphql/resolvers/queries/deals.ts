import {
  checkPermission,
  moduleRequireLogin,
} from "@erxes/api-utils/src/permissions";
import dealResolvers from "../customResolvers/deal";
import { IListParams } from "./boards";
import {
  archivedItems,
  archivedItemsCount,
  checkItemPermByUser,
  generateDealCommonFilters,
  getItemList,
  IArchiveArgs,
} from "./utils";
import { IContext } from "../../../connectionResolver";
import { sendProductsMessage } from "../../../messageBroker";

interface IDealListParams extends IListParams {
  productIds?: [string];
}

const dealQueries = {
  /**
   * Deals list
   */
  async deals(
    _root,
    args: IDealListParams,
    { user, commonQuerySelector, models, subdomain }: IContext
  ) {
    const filter = {
      ...commonQuerySelector,
      ...(await generateDealCommonFilters(models, subdomain, user._id, args)),
    };

    return models.Deals.find(filter);
  },

  async dealsTotalCount(
    _root,
    args: IDealListParams,
    { user, models, subdomain }: IContext
  ) {
    const filter = await generateDealCommonFilters(models, subdomain, user._id, args);

    return models.Deals.find(filter).countDocuments();
  },

  /**
   * Archived list
   */
  archivedDeals(_root, args: IArchiveArgs, { models }: IContext) {
    return archivedItems(models, args, models.Deals);
  },

  archivedDealsCount(_root, args: IArchiveArgs, { models }: IContext) {
    return archivedItemsCount(models, args, models.Deals);
  },

  /**
   *  Deal total amounts
   */
  async dealsTotalAmounts(
    _root,
    args: IDealListParams,
    { user, models, subdomain }: IContext
  ) {
    const filter = await generateDealCommonFilters(models, subdomain, user._id, args);

    const amountList = await models.Deals.aggregate([
      {
        $match: filter,
      },
      {
        $lookup: {
          from: "stages",
          let: { letStageId: "$stageId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$letStageId"],
                },
              },
            },
            {
              $project: {
                probability: {
                  $cond: {
                    if: {
                      $or: [
                        { $eq: ["$probability", "Won"] },
                        { $eq: ["$probability", "Lost"] },
                      ],
                    },
                    then: "$probability",
                    else: "In progress",
                  },
                },
              },
            },
          ],
          as: "stageProbability",
        },
      },
      {
        $unwind: "$productsData",
      },
      {
        $unwind: "$stageProbability",
      },
      {
        $project: {
          amount: "$productsData.amount",
          currency: "$productsData.currency",
          type: "$stageProbability.probability",
          tickUsed: "$productsData.tickUsed",
        },
      },
      {
        $match: { tickUsed: true },
      },
      {
        $group: {
          _id: { currency: "$currency", type: "$type" },

          amount: { $sum: "$amount" },
        },
      },
      {
        $group: {
          _id: "$_id.type",
          currencies: {
            $push: { amount: "$amount", name: "$_id.currency" },
          },
        },
      },
      {
        $sort: { _id: -1 },
      },
    ]);

    return amountList.map((type) => {
      return {
        _id: Math.random(),
        name: type._id,
        currencies: type.currencies,
      };
    });
  },

  /**
   * Deal detail
   */
  async dealDetail(
    _root,
    { _id }: { _id: string },
    { user, models }: IContext
  ) {
    const deal = await models.Deals.getDeal(_id);

    return checkItemPermByUser(models, user._id, deal);
  },
};

moduleRequireLogin(dealQueries);

checkPermission(dealQueries, "deals", "showDeals", []);

export default dealQueries;
