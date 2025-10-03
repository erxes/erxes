import { IContext } from '~/connectionResolvers';
import { IStageDocument } from '~/modules/sales/@types';
import { SALES_STATUSES, VISIBILITIES } from '~/modules/sales/constants';
import { getAmountsMap } from '~/modules/sales/utils';
import { generateFilter } from '../queries/deals';

export default {
  async __resolveReference({ _id }, { models }: IContext) {
    return models.Stages.findOne({ _id });
  },

  members(stage: IStageDocument) {
    if (stage.visibility === VISIBILITIES.PRIVATE && stage.memberIds) {
      return stage.memberIds.map((memberId) => ({
        __typename: 'User',
        _id: memberId,
      }));
    }

    return [];
  },

  async unUsedAmount(
    stage: IStageDocument,
    _args,
    { user, models }: IContext,
    { variableValues: args },
  ) {
    let amountsMap = {};

    amountsMap = getAmountsMap(models, models.Deals, user, args, stage, false);

    return amountsMap;
  },

  async amount(
    stage: IStageDocument,
    _args,
    { user, models }: IContext,
    { variableValues: args },
  ) {
    let amountsMap = {};

    amountsMap = getAmountsMap(models, models.Deals, user, args, stage);

    return amountsMap;
  },

  async itemsTotalCount(
    stage: IStageDocument,
    _args,
    { user, models }: IContext,
    { variableValues: args },
  ) {
    const filter = await generateFilter(
      models,
      user._id,
      { ...args, ...args.extraParams, stageId: stage._id, pipelineId: stage.pipelineId, },
    );

    return models.Deals.find(filter).countDocuments();
  },

  /*
   * Total count of deals that are created on this stage initially
   */
  async initialDealsTotalCount(
    stage: IStageDocument,
    _args,
    { user, models }: IContext,
    { variableValues: args },
  ) {
    const filter = await generateFilter(
      models,
      user._id,
      { ...args, ...args.extraParams, initialStageId: stage._id }
    );

    return models.Deals.find(filter).countDocuments();
  },

  /*
   * Total count of deals that are
   * 1. created on this stage initially
   * 2. moved to other stage which has probability other than Lost
   */
  async inProcessDealsTotalCount(
    stage: IStageDocument,
    _args,
    { models: { Stages } }: IContext,
  ) {
    const filter = {
      pipelineId: stage.pipelineId,
      probability: { $ne: 'Lost' },
      _id: { $ne: stage._id },
    };

    const deals = await Stages.aggregate([
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
                    { $ne: ['$status', SALES_STATUSES.ARCHIVED] },
                  ],
                },
              },
            },
          ],
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

  async stayedDealsTotalCount(
    stage: IStageDocument,
    _args,
    { user, models }: IContext,
    { variableValues: args },
  ) {
    const filter = await generateFilter(
      models,
      user._id,
      {
        ...args,
        ...args.extraParams,
        initialStageId: stage._id,
        stageId: stage._id,
        pipelineId: stage.pipelineId,
      }
    );

    return models.Deals.find(filter).countDocuments();
  },

  /*
   * Compare current stage with next stage
   * by initial and current deals count
   */

  async compareNextStage(
    stage: IStageDocument,
    _args,
    { models: { Stages } }: IContext,
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
                    { $ne: ['$status', SALES_STATUSES.ARCHIVED] },
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
                    { $ne: ['$status', SALES_STATUSES.ARCHIVED] },
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
};
