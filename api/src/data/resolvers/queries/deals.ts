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
      // products: await dealResolvers.products(item),
      amount: await dealResolvers.amount(item)
    });

    console.log('------------------------------', args.stageId);
    const deals = await getItemList(
      filter,
      args,
      user,
      'deal',
      { productsData: 1 },
      getExtraFields
    );

    const dealProductIds: string[] = [];
    for (const deal of deals) {
      for (const pData of deal.productsData) {
        dealProductIds.push(pData.productId);
      }
    }

    const products = await Products.find({
      _id: { $in: [...new Set(dealProductIds)] }
    });

    const products_by_id = {};
    for (const product of products) {
      if (!Object.keys(products_by_id).includes(product._id)) {
        products_by_id[product._id] = product;
      }
    }

    for (const deal of deals) {
      if (!deal.productsData) {
        continue;
      }

      deal['products'] = [];
      for (const pData of deal.productsData) {
        if (!pData.productId) {
          continue;
        }
        deal['products'].push({
          ...(typeof pData.toJSON === 'function' ? pData.toJSON() : pData),
          product: products_by_id[pData.productId]
        });
      }
    }

    return deals;
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

    const dealCount = await Deals.find(filter).countDocuments();
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

    const totalForType = amountList.map(type => {
      return {
        _id: Math.random(),
        name: type._id,
        currencies: type.currencies
      };
    });

    return { _id: Math.random(), dealCount, totalForType };
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
