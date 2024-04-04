import { PLAN_STATUSES } from '../../common/constants';
import { IContext } from '../../connectionResolver';
import { sendCardsMessage, sendCoreMessage } from '../../messageBroker';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Plans.findOne({ _id });
  },
  async structureDetail(
    { structureType, structureTypeId },
    {},
    { models, subdomain }: IContext
  ) {
    switch (structureType) {
      case 'branch':
        return await sendCoreMessage({
          subdomain,
          action: 'branches.findOne',
          data: {
            _id: structureTypeId
          },
          isRPC: true,
          defaultValue: null
        });
      case 'department':
        return await sendCoreMessage({
          subdomain,
          action: 'departments.findOne',
          data: {
            _id: structureTypeId
          },
          isRPC: true,
          defaultValue: null
        });
      case 'operation':
        return await models.Operations.findOne({ _id: structureTypeId }).lean();
      default:
        return null;
    }
  },

  async planner({ plannerId }, {}, { subdomain }: IContext) {
    return await sendCoreMessage({
      subdomain,
      action: 'users.findOne',
      data: {
        _id: plannerId
      },
      isRPC: true,
      defaultValue: null
    });
  },

  async cards(
    { status, cardIds, configs },
    {},
    { models, subdomain }: IContext
  ) {
    if (status !== PLAN_STATUSES.ARCHIVED) {
      return null;
    }

    const cards = await sendCardsMessage({
      subdomain,
      action: `${configs.cardType}s.find`,
      data: { _id: { $in: cardIds } },
      isRPC: true,
      defaultValue: []
    });

    return cards;
  },

  async riskAssessments({ cardIds }, {}, { models }: IContext) {
    return await models.RiskAssessments.find({ cardId: { $in: cardIds } });
  },

  async dashboard(
    { cardIds, configs, status },
    {},
    { models, subdomain }: IContext
  ) {
    if (status !== PLAN_STATUSES.ARCHIVED) {
      return null;
    }

    const totalCards = !!cardIds?.length ? cardIds.length : 0;

    let averangeAssessment = 0;

    let submittedAssessmentCount = 0;
    let resolvedCardsCount = 0;

    await models.RiskAssessments.aggregate([
      { $match: { cardId: { $in: cardIds } } },
      {
        $group: {
          _id: null,
          avarangeScore: { $avg: '$resultScore' },
          submittedAssessmentCount: {
            $sum: { $cond: [{ $ne: ['$status', 'In Progress'] }, 1, 0] }
          }
        }
      }
    ]).then(result => {
      averangeAssessment = result[0]?.avarangeScore || 0;
      submittedAssessmentCount = result[0]?.submittedAssessmentCount || 0;
    });

    const stages = await sendCardsMessage({
      subdomain,
      action: 'stages.find',
      data: {
        probability: 'Resolved',
        status: 'active',
        pipelineId: configs.pipelineId
      },
      isRPC: true,
      defaultValue: []
    });

    const stageIds = stages.map(stage => stage._id);

    const cards = await sendCardsMessage({
      subdomain,
      action: `${configs.cardType}s.find`,
      data: {
        _id: { $in: cardIds },
        stageId: { $in: stageIds }
      },
      isRPC: true,
      defaultValue: []
    });

    resolvedCardsCount = cards?.length || 0;

    return {
      totalCards,
      averangeAssessment,
      submittedAssessmentCount,
      resolvedCardsCount
    };
  }
};
