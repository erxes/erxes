import { Deals, Products } from '../../../db/models';
import {
  checkPermission,
  moduleRequireLogin
} from '../../permissions/wrappers';
import { IContext } from '../../types';
import dealResolvers from '../deals';
import { IListParams } from './boards';
import {
  archivedItems,
  archivedItemsCount,
  checkItemPermByUser,
  generateDealCommonFilters,
  getItemList,
  IArchiveArgs
} from './boardUtils';

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
    { user, commonQuerySelector }: IContext
  ) {
    const filter = {
      ...commonQuerySelector,
      ...(await generateDealCommonFilters(user._id, args))
    };

    const getExtraFields = async (item: any) => ({
      amount: await dealResolvers.amount(item)
    });

    const deals = await getItemList(
      filter,
      args,
      user,
      'deal',
      { productsData: 1 },
      getExtraFields
    );

    const dealProductIds = deals.flatMap(deal => {
      if (deal.productsData && deal.productsData.length > 0) {
        return deal.productsData.flatMap(pData => pData.productId || []);
      }

      return [];
    });

    const products = await Products.find({
      _id: { $in: [...new Set(dealProductIds)] }
    });

    for (const deal of deals) {
      if (
        !deal.productsData ||
        (deal.productsData && deal.productsData.length === 0)
      ) {
        continue;
      }

      deal.products = [];

      for (const pData of deal.productsData) {
        if (!pData.productId) {
          continue;
        }

        deal.products.push({
          ...(typeof pData.toJSON === 'function' ? pData.toJSON() : pData),
          product: products.find(p => p._id === pData.productId) || {}
        });
      }
    }

    return deals;
  },

  async dealsTotalCount(_root, args: IDealListParams, { user }: IContext) {
    const filter = await generateDealCommonFilters(user._id, args);

    return Deals.find(filter).countDocuments();
  },

  /**
   * Archived list
   */
  archivedDeals(_root, args: IArchiveArgs) {
    return archivedItems(args, Deals);
  },

  archivedDealsCount(_root, args: IArchiveArgs) {
    return archivedItemsCount(args, Deals);
  },

  /**
   *  Deal total amounts
   */
  async dealsTotalAmounts(_root, args: IDealListParams, { user }: IContext) {
    const filter = await generateDealCommonFilters(user._id, args);

    const amountList = await Deals.aggregate([
      {
        $match: filter
      },
      {
        $lookup: {
          from: 'stages',
          let: { letStageId: '$stageId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$letStageId']
                }
              }
            },
            {
              $project: {
                probability: {
                  $cond: {
                    if: {
                      $or: [
                        { $eq: ['$probability', 'Won'] },
                        { $eq: ['$probability', 'Lost'] }
                      ]
                    },
                    then: '$probability',
                    else: 'In progress'
                  }
                }
              }
            }
          ],
          as: 'stageProbability'
        }
      },
      {
        $unwind: '$productsData'
      },
      {
        $unwind: '$stageProbability'
      },
      {
        $project: {
          amount: '$productsData.amount',
          currency: '$productsData.currency',
          type: '$stageProbability.probability',
          tickUsed: '$productsData.tickUsed'
        }
      },
      {
        $match: { tickUsed: true }
      },
      {
        $group: {
          _id: { currency: '$currency', type: '$type' },

          amount: { $sum: '$amount' }
        }
      },
      {
        $group: {
          _id: '$_id.type',
          currencies: {
            $push: { amount: '$amount', name: '$_id.currency' }
          }
        }
      },
      {
        $sort: { _id: -1 }
      }
    ]);

    return amountList.map(type => {
      return {
        _id: Math.random(),
        name: type._id,
        currencies: type.currencies
      };
    });
  },

  /**
   * Deal detail
   */
  async dealDetail(_root, { _id }: { _id: string }, { user }: IContext) {
    const deal = await Deals.getDeal(_id);

    return checkItemPermByUser(user._id, deal);
  }
};

moduleRequireLogin(dealQueries);

checkPermission(dealQueries, 'deals', 'showDeals', []);

export default dealQueries;
