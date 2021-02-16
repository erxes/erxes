import { Deals } from '../../../db/models';
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
  generateDealCommonFilters,
  generateSort,
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
    const sort = generateSort(args);

    const limit = args.limit !== undefined ? args.limit : 10;

    return Deals.find(filter)
      .sort(sort)
      .skip(args.skip || 0)
      .limit(limit);
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
