import { Deals } from '../../db/models';
import { IStageDocument } from '../../db/models/definitions/deals';

export default {
  async amount(stage: IStageDocument) {
    const amountList = await Deals.aggregate([
      {
        $match: { stageId: stage._id },
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

  dealsTotalCount(stage: IStageDocument) {
    return Deals.count({ stageId: stage._id });
  },

  deals(stage: IStageDocument) {
    return Deals.find({ stageId: stage._id }).sort({ order: 1, createdAt: -1 });
  },
};
