import { IContext } from "../../../connectionResolver";
import { IStageDocument } from "../../../models/definitions/boards";
import {
  BOARD_STATUSES,
  BOARD_TYPES,
  VISIBLITIES
} from "../../../models/definitions/constants";
import {
  generateDealCommonFilters,
  generateTicketCommonFilters
} from "../queries/utils";

const getAmountsMap = async (
  subdomain,
  models,
  collection,
  user,
  args,
  stage,
  tickUsed = true
) => {
  const amountsMap = {};
  const filter = await generateDealCommonFilters(
    models,
    subdomain,
    user._id,
    { ...args, stageId: stage._id, pipelineId: stage.pipelineId },
    args.extraParams
  );

  const amountList = await collection.aggregate([
    {
      $match: filter
    },
    {
      $unwind: "$productsData"
    },
    {
      $project: {
        amount: "$productsData.amount",
        currency: "$productsData.currency",
        tickUsed: "$productsData.tickUsed"
      }
    },
    {
      $match: { tickUsed }
    },
    {
      $group: {
        _id: "$currency",
        amount: { $sum: "$amount" }
      }
    }
  ]);

  amountList.forEach(item => {
    if (item._id) {
      amountsMap[item._id] = item.amount;
    }
  });
  return amountsMap;
};

export default {
  async __resolveReference({ _id }, { models }: IContext) {
    return models.Stages.findOne({ _id });
  },

  members(stage: IStageDocument, {}) {
    if (stage.visibility === VISIBLITIES.PRIVATE && stage.memberIds) {
      return stage.memberIds.map(memberId => ({
        __typename: "User",
        _id: memberId
      }));
    }

    return [];
  },

  async unUsedAmount(
    stage: IStageDocument,
    _args,
    { user, models, subdomain }: IContext,
    { variableValues: args }
  ) {
    let amountsMap = {};

    if (stage.type === BOARD_TYPES.TICKET) {
      amountsMap = getAmountsMap(
        subdomain,
        models,
        models.Tickets,
        user,
        args,
        stage,
        false
      );
    }

    return amountsMap;
  },

  async amount(
    stage: IStageDocument,
    _args,
    { user, models, subdomain }: IContext,
    { variableValues: args }
  ) {
    let amountsMap = {};

    if (stage.type === BOARD_TYPES.TICKET) {
      amountsMap = getAmountsMap(
        subdomain,
        models,
        models.Tickets,
        user,
        args,
        stage
      );
    }

    return amountsMap;
  },

  async itemsTotalCount(
    stage: IStageDocument,
    _args,
    { user, models, subdomain }: IContext,
    { variableValues: args }
  ) {
    const { Tickets } = models;

    switch (stage.type) {
      case BOARD_TYPES.TICKET: {
        const filter = await generateTicketCommonFilters(
          models,
          subdomain,
          user._id,
          { ...args, stageId: stage._id, pipelineId: stage.pipelineId },
          args.extraParams
        );

        return Tickets.find(filter).countDocuments();
      }
    }
  },

  /*
   * Total count of ticket that are created on this stage initially
   */
  async initialTicketTotalCount(
    stage: IStageDocument,
    _args,
    { user, models, subdomain }: IContext,
    { variableValues: args }
  ) {
    const filter = await generateTicketCommonFilters(
      models,
      subdomain,
      user._id,
      { ...args, initialStageId: stage._id },
      args.extraParams
    );

    return models.Tickets.find(filter).countDocuments();
  },

  /*
   * Total count of tickets that are
   * 1. created on this stage initially
   * 2. moved to other stage which has probability other than Lost
   */
  async inProcessTicketsTotalCount(
    stage: IStageDocument,
    _args,
    { models: { Stages } }: IContext
  ) {
    const filter = {
      pipelineId: stage.pipelineId,
      probability: { $ne: "Lost" },
      _id: { $ne: stage._id }
    };

    const tickets = await Stages.aggregate([
      {
        $match: filter
      },
      {
        $lookup: {
          from: "tickets",
          let: { stageId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$stageId", "$$stageId"] },
                    { $ne: ["$status", BOARD_STATUSES.ARCHIVED] }
                  ]
                }
              }
            }
          ],
          as: "tickets"
        }
      },
      {
        $project: {
          name: 1,
          tickets: 1
        }
      },
      {
        $unwind: "$tickets"
      },
      {
        $match: {
          "tickets.initialStageId": stage._id
        }
      }
    ]);

    return tickets.length;
  },

  async stayedTicketsTotalCount(
    stage: IStageDocument,
    _args,
    { user, models, subdomain }: IContext,
    { variableValues: args }
  ) {
    const filter = await generateTicketCommonFilters(
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

    return models.Tickets.find(filter).countDocuments();
  },

  async compareNextStageTicket(
    stage: IStageDocument,
    _args,
    { models: { Stages } }: IContext
  ) {
    const result: { count?: number; percent?: number } = {};

    const { order = 1 } = stage;

    const filter = {
      order: { $in: [order, order + 1] },
      probability: { $ne: "Lost" },
      pipelineId: stage.pipelineId
    };

    const stages = await Stages.aggregate([
      {
        $match: filter
      },
      {
        $lookup: {
          from: "tickets",
          let: { stageId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$stageId", "$$stageId"] },
                    { $ne: ["$status", BOARD_STATUSES.ARCHIVED] }
                  ]
                }
              }
            }
          ],
          as: "currentTickets"
        }
      },
      {
        $lookup: {
          from: "tickets",
          let: { stageId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$initialStageId", "$$stageId"] },
                    { $ne: ["$status", BOARD_STATUSES.ARCHIVED] }
                  ]
                }
              }
            }
          ],
          as: "initialTickets"
        }
      },
      {
        $project: {
          order: 1,
          currentTicketCount: { $size: "$currentTickets" },
          initialTicketCount: { $size: "$initialTickets" }
        }
      },
      { $sort: { order: 1 } }
    ]);

    if (stages.length === 2) {
      const [first, second] = stages;
      result.count = first.currentTicketCount - second.currentTicketCount;
      result.percent =
        (second.initialTicketCount * 100) / first.initialTicketCount;
    }

    return result;
  }
};
