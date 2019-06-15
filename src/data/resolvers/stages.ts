import { Deals, Tasks, Tickets } from '../../db/models';
import { IStageDocument } from '../../db/models/definitions/boards';
import { BOARD_TYPES } from '../../db/models/definitions/constants';
import { generateCommonFilters } from './queries/utils';

export default {
  async amount(stage: IStageDocument, _args, _context, { variableValues: args }) {
    const amountsMap = {};

    const filter = await generateCommonFilters({ ...args, stageId: stage._id });

    if (stage.type === BOARD_TYPES.DEAL) {
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

      amountList.forEach(item => {
        if (item._id) {
          amountsMap[item._id] = item.amount;
        }
      });
    }

    return amountsMap;
  },

  async itemsTotalCount(stage: IStageDocument, _args, _context, { variableValues: args }) {
    const filter = await generateCommonFilters({ ...args, stageId: stage._id });

    switch (stage.type) {
      case BOARD_TYPES.DEAL: {
        return Deals.find(filter).countDocuments();
      }
      case BOARD_TYPES.TICKET: {
        return Tickets.find(filter).countDocuments();
      }
      case BOARD_TYPES.TASK: {
        return Tasks.find(filter).countDocuments();
      }
    }
  },
};
