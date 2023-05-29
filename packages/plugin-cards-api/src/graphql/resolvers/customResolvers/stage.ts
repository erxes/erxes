import { IContext } from '../../../connectionResolver';
import { IStageDocument } from '../../../models/definitions/boards';
import {
  BOARD_STATUSES,
  BOARD_TYPES,
  VISIBLITIES
} from '../../../models/definitions/constants';
import {
  generateDealCommonFilters,
  generateGrowthHackCommonFilters,
  generateTaskCommonFilters,
  generateTicketCommonFilters,
  generatePurchaseCommonFilters
} from '../queries/utils';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Stages.findOne({ _id });
  },

  members(stage: IStageDocument, {}) {
    if (stage.visibility === VISIBLITIES.PRIVATE && stage.memberIds) {
      return stage.memberIds.map(memberId => ({
        __typename: 'User',
        _id: memberId
      }));
    }

    return [];
  },

  async amount(
    stage: IStageDocument,
    _args,
    { user, models, subdomain }: IContext,
    { variableValues: args }
  ) {
    const amountsMap = {};

    if (stage.type === BOARD_TYPES.DEAL) {
      const filter = await generateDealCommonFilters(
        models,
        subdomain,
        user._id,
        { ...args, stageId: stage._id, pipelineId: stage.pipelineId },
        args.extraParams
      );

      const amountList = await models.Deals.aggregate([
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

    if (stage.type === BOARD_TYPES.PURCHASE) {
      const filter = await generatePurchaseCommonFilters(
        models,
        subdomain,
        user._id,
        { ...args, stageId: stage._id, pipelineId: stage.pipelineId },
        args.extraParams
      );

      const amountList = await models.Purchases.aggregate([
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
    { user, models, subdomain }: IContext,
    { variableValues: args }
  ) {
    const { Deals, Tickets, Tasks, GrowthHacks, Purchases } = models;

    switch (stage.type) {
      case BOARD_TYPES.DEAL: {
        const filter = await generateDealCommonFilters(
          models,
          subdomain,
          user._id,
          { ...args, stageId: stage._id, pipelineId: stage.pipelineId },
          args.extraParams
        );

        return Deals.find(filter).count();
      }
      case BOARD_TYPES.TICKET: {
        const filter = await generateTicketCommonFilters(
          models,
          subdomain,
          user._id,
          { ...args, stageId: stage._id, pipelineId: stage.pipelineId },
          args.extraParams
        );

        return Tickets.find(filter).count();
      }
      case BOARD_TYPES.TASK: {
        const filter = await generateTaskCommonFilters(
          models,
          subdomain,
          user._id,
          {
            ...args,
            stageId: stage._id,
            pipelineId: stage.pipelineId
          },
          args.extraParams
        );

        return Tasks.find(filter).count();
      }
      case BOARD_TYPES.GROWTH_HACK: {
        const filter = await generateGrowthHackCommonFilters(
          models,
          subdomain,
          user._id,
          { ...args, stageId: stage._id, pipelineId: stage.pipelineId },
          args.extraParams
        );

        return GrowthHacks.find(filter).count();
      }
      case BOARD_TYPES.PURCHASE: {
        const filter = await generatePurchaseCommonFilters(
          models,
          subdomain,
          user._id,
          { ...args, stageId: stage._id, pipelineId: stage.pipelineId },
          args.extraParams
        );

        return Purchases.find(filter).count();
      }
    }
  },

  /*
   * Total count of deals that are created on this stage initially
   */
  async initialDealsTotalCount(
    stage: IStageDocument,
    _args,
    { user, models, subdomain }: IContext,
    { variableValues: args }
  ) {
    const filter = await generateDealCommonFilters(
      models,
      subdomain,
      user._id,
      { ...args, initialStageId: stage._id },
      args.extraParams
    );

    return models.Deals.find(filter).count();
  },

  /*
   * Total count of purchase that are created on this stage initially
   */
  async initialPurchaseTotalCount(
    stage: IStageDocument,
    _args,
    { user, models, subdomain }: IContext,
    { variableValues: args }
  ) {
    const filter = await generatePurchaseCommonFilters(
      models,
      subdomain,
      user._id,
      { ...args, initialStageId: stage._id },
      args.extraParams
    );

    return models.Purchases.find(filter).count();
  },

  /*
   * Total count of deals that are
   * 1. created on this stage initially
   * 2. moved to other stage which has probability other than Lost
   */
  async inProcessDealsTotalCount(
    stage: IStageDocument,
    _args,
    { models: { Stages } }: IContext
  ) {
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

  /*
   * Total count of purchases that are
   * 1. created on this stage initially
   * 2. moved to other stage which has probability other than Lost
   */
  async inProcessPurchasesTotalCount(
    stage: IStageDocument,
    _args,
    { models: { Stages } }: IContext
  ) {
    const filter = {
      pipelineId: stage.pipelineId,
      probability: { $ne: 'Lost' },
      _id: { $ne: stage._id }
    };

    const purchases = await Stages.aggregate([
      {
        $match: filter
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
                    { $ne: ['$status', BOARD_STATUSES.ARCHIVED] }
                  ]
                }
              }
            }
          ],
          as: 'purchases'
        }
      },
      {
        $project: {
          name: 1,
          purchases: 1
        }
      },
      {
        $unwind: '$purchases'
      },
      {
        $match: {
          'purchases.initialStageId': stage._id
        }
      }
    ]);

    return purchases.length;
  },

  async stayedDealsTotalCount(
    stage: IStageDocument,
    _args,
    { user, models, subdomain }: IContext,
    { variableValues: args }
  ) {
    const filter = await generateDealCommonFilters(
      models,
      subdomain,
      user._id,
      {
        ...args,
        initialStageId: stage._id,
        stageId: stage._id,
        pipelineId: stage.pipelineId
      },
      args.extraParams
    );

    return models.Deals.find(filter).count();
  },

  async stayedPurchasesTotalCount(
    stage: IStageDocument,
    _args,
    { user, models, subdomain }: IContext,
    { variableValues: args }
  ) {
    const filter = await generatePurchaseCommonFilters(
      models,
      subdomain,
      user._id,
      {
        ...args,
        initialStageId: stage._id,
        stageId: stage._id,
        pipelineId: stage.pipelineId
      },
      args.extraParams
    );

    return models.Purchases.find(filter).count();
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
      pipelineId: stage.pipelineId
    };

    const stages = await Stages.aggregate([
      {
        $match: filter
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
                    { $ne: ['$status', BOARD_STATUSES.ARCHIVED] }
                  ]
                }
              }
            }
          ],
          as: 'currentPurchases'
        }
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
                    { $ne: ['$status', BOARD_STATUSES.ARCHIVED] }
                  ]
                }
              }
            }
          ],
          as: 'initialPurchases'
        }
      },
      {
        $project: {
          order: 1,
          currentPurchaseCount: { $size: '$currentPurchases' },
          initialPurchaseCount: { $size: '$initialPurchases' }
        }
      },
      { $sort: { order: 1 } }
    ]);

    if (stages.length === 2) {
      const [first, second] = stages;
      result.count = first.currentPurchaseCount - second.currentPurchaseCount;
      result.percent =
        (second.initialPurchaseCount * 100) / first.initialPurchaseCount;
    }

    return result;
  }
};
