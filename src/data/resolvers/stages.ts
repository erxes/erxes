import { Deals, Stages, Tasks, Tickets } from '../../db/models';
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

  /*
   * Total count of deals that are created on this stage initially
   */
  async initialDealsTotalCount(stage: IStageDocument, _args, _context, { variableValues: args }) {
    const filter = await generateDealCommonFilters({ ...args, initialStageId: stage._id }, args.extraParams);

    return Deals.find(filter).countDocuments();
  },

  /*
   * Total count of deals that are
   * 1. created on this stage initially
   * 2. moved to other stage which has probability other than Lost
   */
  async inProcessDealsTotalCount(stage: IStageDocument, _args, _context, { variableValues: args }) {
    const filter = await generateDealCommonFilters(
      {
        ...args,
        $and: [{ pipelineId: stage.pipelineId }, { probability: { $ne: 'Lost' } }, { _id: { $ne: stage._id } }],
      },
      args.extraParams,
    );

    const deals = await Stages.aggregate([
      {
        $match: filter,
      },
      {
        $lookup: {
          from: 'deals',
          localField: '_id',
          foreignField: 'stageId',
          as: 'deals',
        },
      },
      {
        $project: {
          name: 1,
          deals: 1,
        },
      },
      {
        $unwind: '$deals',
      },
      {
        $match: {
          'deals.initialStageId': stage._id,
        },
      },
    ]);

    return deals.length;
  },

  async stayedDealsTotalCount(stage: IStageDocument, _args, _context, { variableValues: args }) {
    const filter = await generateDealCommonFilters(
      { ...args, initialStageId: stage._id, stageId: stage._id },
      args.extraParams,
    );

    return Deals.find(filter).countDocuments();
  },

  /*
   * Compare current stage with next stage
   * by initial and current deals count
   */
  async compareNextStage(stage: IStageDocument, _args, _context, { variableValues: args }) {
    const result: { count?: number; percent?: number } = {};

    const { order = 1 } = stage;

    const filter = await generateDealCommonFilters(
      {
        ...args,
        order: { $in: [order, order + 1] },
        probability: { $ne: 'Lost' },
      },
      args.extraParams,
    );

    filter.pipelineId = stage.pipelineId;

    const stages = await Stages.aggregate([
      {
        $match: filter,
      },
      {
        $lookup: {
          from: 'deals',
          localField: '_id',
          foreignField: 'stageId',
          as: 'currentDeals',
        },
      },
      {
        $lookup: {
          from: 'deals',
          localField: '_id',
          foreignField: 'initialStageId',
          as: 'initialDeals',
        },
      },
      {
        $project: {
          order: 1,
          currentDealCount: { $size: '$currentDeals' },
          initialDealCount: { $size: '$initialDeals' },
        },
      },
      { $sort: { order: 1 } },
    ]);

    if (stages.length === 2) {
      const [first, second] = stages;
      result.count = first.currentDealCount - second.currentDealCount;
      result.percent = (second.initialDealCount * 100) / first.initialDealCount;
    }

    return result;
  },
};
