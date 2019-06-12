import { Deals } from '../../../db/models';
import { checkPermission, moduleRequireLogin } from '../../permissions';
import { IListParams } from './boardTypes';
import { generateCommonFilters } from './utils';

interface IDealListParams extends IListParams {
  productIds?: [string];
}

const dealQueries = {
  /**
   * Deals list
   */
  async deals(_root, args: IDealListParams) {
    const filter = await generateCommonFilters(args);
    const sort = { order: 1, createdAt: -1 };

    return Deals.find(filter)
      .sort(sort)
      .skip(args.skip || 0)
      .limit(10);
  },

  /**
   *  Deal total amounts
   */
  async dealsTotalAmounts(_root, args: IDealListParams) {
    const filter = await generateCommonFilters(args);

    const dealCount = await Deals.find(filter).countDocuments();
    const amountList = await Deals.aggregate([
      {
        $match: filter,
      },
      {
        $unwind: '$productsData',
      },
      {
        $project: {
          amount: '$productsData.amount',
          currency: '$productsData.currency',
        },
      },
      {
        $group: {
          _id: '$currency',
          amount: { $sum: '$amount' },
        },
      },
    ]);

    const dealAmounts = amountList.map(deal => {
      return { _id: Math.random(), currency: deal._id, amount: deal.amount };
    });

    return { _id: Math.random(), dealCount, dealAmounts };
  },

  /**
   * Deal detail
   */
  dealDetail(_root, { _id }: { _id: string }) {
    return Deals.findOne({ _id });
  },
};

moduleRequireLogin(dealQueries);

checkPermission(dealQueries, 'deals', 'showDeals', []);

export default dealQueries;
