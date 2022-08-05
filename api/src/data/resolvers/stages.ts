import { Deals, GrowthHacks, Stages, Tasks, Tickets } from '../../db/models';
import { IStageDocument } from '../../db/models/definitions/boards';
import {
  BOARD_STATUSES,
  BOARD_TYPES
} from '../../db/models/definitions/constants';
import { IContext } from '../types';
import {
  generateDealCommonFilters,
  generateGrowthHackCommonFilters,
  generateTaskCommonFilters,
  generateTicketCommonFilters
} from './queries/boardUtils';

export default {
  async amount(
    stage: IStageDocument,
    _args,
    { user }: IContext,
    { variableValues: args }
  ) {
    const amountsMap = {};

    if (stage.type === BOARD_TYPES.DEAL) {
      const filter = await generateDealCommonFilters(
        user._id,
        { ...args, stageId: stage._id, pipelineId: stage.pipelineId },
        args.extraParams
      );

      const amountList = await Deals.aggregate([
        {
          $match: filter
        },
        {
          $unwind: '$productsData'
        },
        {
          $project: {
            amount: '$productsData.amount',
            currency: '$productsData.currency',
            tickUsed: '$productsData.tickUsed'
          }
        },
        {
          $match: { tickUsed: true }
        },
        {
          $group: {
            _id: '$currency',
            amount: { $sum: '$amount' }
          }
        }
      ]);

      amountList.forEach(item => {
        if (item._id) {
          amountsMap[item._id] = item.amount;
        }
      });
    }

    return amountsMap;
  },

  async itemsTotalCount(
    stage: IStageDocument,
    _args,
    { user }: IContext,
    { variableValues: args }
  ) {
    switch (stage.type) {
      case BOARD_TYPES.DEAL: {
        const filter = await generateDealCommonFilters(
          user._id,
          { ...args, stageId: stage._id, pipelineId: stage.pipelineId },
          args.extraParams
        );

        return Deals.find(filter).countDocuments();
      }
      case BOARD_TYPES.TICKET: {
        const filter = await generateTicketCommonFilters(
          user._id,
          { ...args, stageId: stage._id, pipelineId: stage.pipelineId },
          args.extraParams
        );

        return Tickets.find(filter).countDocuments();
      }
      case BOARD_TYPES.TASK: {
        const filter = await generateTaskCommonFilters(
          user._id,
          {
            ...args,
            stageId: stage._id,
            pipelineId: stage.pipelineId
          },
          args.extraParams
        );

        return Tasks.find(filter).countDocuments();
      }
      case BOARD_TYPES.GROWTH_HACK: {
        const filter = await generateGrowthHackCommonFilters(
          user._id,
          { ...args, stageId: stage._id, pipelineId: stage.pipelineId },
          args.extraParams
        );

        return GrowthHacks.find(filter).countDocuments();
      }
    }
  },

  /*
   * Total count of deals that are created on this stage initially
   */
  async initialDealsTotalCount(
    stage: IStageDocument,
    _args,
    { user }: IContext,
    { variableValues: args }
  ) {
    const filter = await generateDealCommonFilters(
      user._id,
      { ...args, initialStageId: stage._id },
      args.extraParams
    );

    return Deals.find(filter).countDocuments();
  },

  /*
   * Total count of deals that are
   * 1. created on this stage initially
   * 2. moved to other stage which has probability other than Lost
   */
  async inProcessDealsTotalCount(stage: IStageDocument) {
    const filter = {
      pipelineId: stage.pipelineId,
      probability: { $ne: 'Lost' },
      _id: { $ne: stage._id }
    };

    const deals = await Stages.aggregate([
      {
        $match: filter
      },
      {
        $lookup: {
          from: 'deals',
          let: { stageId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$stageId', '$$stageId'] },
                    { $ne: ['$status', BOARD_STATUSES.ARCHIVED] }
                  ]
                }
              }
            }
          ],
          as: 'deals'
        }
      },
      {
        $project: {
          name: 1,
          deals: 1
        }
      },
      {
        $unwind: '$deals'
      },
      {
        $match: {
          'deals.initialStageId': stage._id
        }
      }
    ]);

    return deals.length;
  },

  async stayedDealsTotalCount(
    stage: IStageDocument,
    _args,
    { user }: IContext,
    { variableValues: args }
  ) {
    const filter = await generateDealCommonFilters(
      user._id,
      {
        ...args,
        initialStageId: stage._id,
        stageId: stage._id,
        pipelineId: stage.pipelineId
      },
      args.extraParams
    );

    return Deals.find(filter).countDocuments();
  },

  /*
   * Compare current stage with next stage
   * by initial and current deals count
   */
  async compareNextStage(stage: IStageDocument) {
    const result: { count?: number; percent?: number } = {};

    const { order = 1 } = stage;

    const filter = {
      order: { $in: [order, order + 1] },
      probability: { $ne: 'Lost' },
      pipelineId: stage.pipelineId
    };

    const stages = await Stages.aggregate([
      {
        $match: filter
      },
      {
        $lookup: {
          from: 'deals',
          let: { stageId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$stageId', '$$stageId'] },
                    { $ne: ['$status', BOARD_STATUSES.ARCHIVED] }
                  ]
                }
              }
            }
          ],
          as: 'currentDeals'
        }
      },
      {
        $lookup: {
          from: 'deals',
          let: { stageId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$initialStageId', '$$stageId'] },
                    { $ne: ['$status', BOARD_STATUSES.ARCHIVED] }
                  ]
                }
              }
            }
          ],
          as: 'initialDeals'
        }
      },
      {
        $project: {
          order: 1,
          currentDealCount: { $size: '$currentDeals' },
          initialDealCount: { $size: '$initialDeals' }
        }
      },
      { $sort: { order: 1 } }
    ]);

    if (stages.length === 2) {
      const [first, second] = stages;
      result.count = first.currentDealCount - second.currentDealCount;
      result.percent = (second.initialDealCount * 100) / first.initialDealCount;
    }

    return result;
  }
};
