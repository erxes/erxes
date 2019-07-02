import { Deals, Tasks, Tickets } from '../../db/models';
import { IStageDocument } from '../../db/models/definitions/boards';
import { BOARD_TYPES } from '../../db/models/definitions/constants';
import {
  generateDealCommonFilters,
  generateTaskCommonFilters,
  generateTicketCommonFilters,
} from './queries/boardUtils';

export default {
  async amount(stage: IStageDocument, _args, _context, { variableValues: args }) {
    const amountsMap = {};

    if (stage.type === BOARD_TYPES.DEAL) {
      const filter = await generateDealCommonFilters({ ...args, stageId: stage._id }, args.extraParams);

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
    switch (stage.type) {
      case BOARD_TYPES.DEAL: {
        const filter = await generateDealCommonFilters({ ...args, stageId: stage._id }, args.extraParams);

        return Deals.find(filter).countDocuments();
      }
      case BOARD_TYPES.TICKET: {
        const filter = await generateTicketCommonFilters({ ...args, stageId: stage._id }, args.extraParams);

        return Tickets.find(filter).countDocuments();
      }
      case BOARD_TYPES.TASK: {
        const filter = await generateTaskCommonFilters({ ...args, stageId: stage._id }, args.extraParams);

        return Tasks.find(filter).countDocuments();
      }
    }
  },
};
