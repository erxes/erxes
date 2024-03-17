import { IContext } from '../../../connectionResolver';
import { IStageDocument } from '../../../models/definitions/boards';
import {
  BOARD_STATUSES,
  BOARD_TYPES,
  VISIBLITIES,
} from '../../../models/definitions/constants';
import { generateTaskCommonFilters } from '../queries/utils';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Stages.findOne({ _id });
  },

  members(stage: IStageDocument, {}) {
    if (stage.visibility === VISIBLITIES.PRIVATE && stage.memberIds) {
      return stage.memberIds.map((memberId) => ({
        __typename: 'User',
        _id: memberId,
      }));
    }

    return [];
  },

  async itemsTotalCount(
    stage: IStageDocument,
    _args,
    { user, models, subdomain }: IContext,
    { variableValues: args }
  ) {
    const { Tasks } = models;

    switch (stage.type) {
      case BOARD_TYPES.TASK: {
        const filter = await generateTaskCommonFilters(
          models,
          subdomain,
          user._id,
          {
            ...args,
            stageId: stage._id,
            pipelineId: stage.pipelineId,
          },
          args.extraParams
        );

        return Tasks.find(filter).count();
      }
    }
  },

  /*
   * Compare current stage with next stage
   * by initial and current deals count
   */
  async compareNextStage(
    stage: IStageDocument,
    _args,
    { models: { Stages } }: IContext
  ) {
    const result: { count?: number; percent?: number } = {};

    const { order = 1 } = stage;

    const filter = {
      order: { $in: [order, order + 1] },
      probability: { $ne: 'Lost' },
      pipelineId: stage.pipelineId,
    };

    const stages = await Stages.aggregate([
      {
        $match: filter,
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
                    { $ne: ['$status', BOARD_STATUSES.ARCHIVED] },
                  ],
                },
              },
            },
          ],
          as: 'currentDeals',
        },
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
                    { $ne: ['$status', BOARD_STATUSES.ARCHIVED] },
                  ],
                },
              },
            },
          ],
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

  async compareNextStagePurchase(
    stage: IStageDocument,
    _args,
    { models: { Stages } }: IContext
  ) {
    const result: { count?: number; percent?: number } = {};

    const { order = 1 } = stage;

    const filter = {
      order: { $in: [order, order + 1] },
      probability: { $ne: 'Lost' },
      pipelineId: stage.pipelineId,
    };

    const stages = await Stages.aggregate([
      {
        $match: filter,
      },
      {
        $lookup: {
          from: 'purchases',
          let: { stageId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$stageId', '$$stageId'] },
                    { $ne: ['$status', BOARD_STATUSES.ARCHIVED] },
                  ],
                },
              },
            },
          ],
          as: 'currentPurchases',
        },
      },
      {
        $lookup: {
          from: 'purchases',
          let: { stageId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$initialStageId', '$$stageId'] },
                    { $ne: ['$status', BOARD_STATUSES.ARCHIVED] },
                  ],
                },
              },
            },
          ],
          as: 'initialPurchases',
        },
      },
      {
        $project: {
          order: 1,
          currentPurchaseCount: { $size: '$currentPurchases' },
          initialPurchaseCount: { $size: '$initialPurchases' },
        },
      },
      { $sort: { order: 1 } },
    ]);

    if (stages.length === 2) {
      const [first, second] = stages;
      result.count = first.currentPurchaseCount - second.currentPurchaseCount;
      result.percent =
        (second.initialPurchaseCount * 100) / first.initialPurchaseCount;
    }

    return result;
  },
};
