import { Deals } from '../../db/models';
import { IStageDocument } from '../../db/models/definitions/deals';
import { generateCommonFilters } from './queries/deals';
import { dealsCommonFilter } from './queries/utils';

export default {
  async amount(stage: IStageDocument, _args, _context, { variableValues: { search, ...args } }) {
    const amountList = await Deals.aggregate([
      {
        $match: dealsCommonFilter({ ...generateCommonFilters(args), stageId: stage._id }, { search }),
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

    const amountsMap = {};

    amountList.forEach(item => {
      if (item._id) {
        amountsMap[item._id] = item.amount;
      }
    });

    return amountsMap;
  },

  dealsTotalCount(stage: IStageDocument, _args, _context, { variableValues: { search, ...args } }) {
    return Deals.find(dealsCommonFilter(generateCommonFilters(args), { search })).count({ stageId: stage._id });
  },

  deals(stage: IStageDocument) {
    return Deals.find({ stageId: stage._id }).sort({ order: 1, createdAt: -1 });
  },
};
