import { IContext } from '../../connectionResolver';
import { sendCardsMessage, sendCoreMessage } from '../../messageBroker';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.RiskAssessments.findOne({ _id });
  },

  async branch(riskAssessment, {}, { subdomain }: IContext) {
    return riskAssessment.branchId
      ? await sendCoreMessage({
          subdomain,
          action: 'branches.findOne',
          data: { _id: riskAssessment.branchId },
          isRPC: true,
          defaultValue: {}
        })
      : null;
  },

  async department(riskAssessment, {}, { subdomain }: IContext) {
    return riskAssessment.departmentId
      ? await sendCoreMessage({
          subdomain,
          action: 'departments.findOne',
          data: { _id: riskAssessment.departmentId },
          isRPC: true,
          defaultValue: {}
        })
      : null;
  },
  async operation(riskAssessment, {}, { models }: IContext) {
    return riskAssessment.operationId
      ? await models.Operations.findOne({
          _id: riskAssessment.operationId
        })
      : null;
  },

  async riskIndicators(riskAssessment, {}, { models }: IContext) {
    if (riskAssessment.groupId) {
      const group = await models.IndicatorsGroups.findOne({
        _id: riskAssessment.groupId
      });
      const indicatorIds = (group?.groups || [])
        .map(group => group.indicatorIds)
        .flat();
      return await models.RiskIndicators.find({
        _id: { $in: indicatorIds }
      });
    }
    const indicator = await models.RiskIndicators.findOne({
      _id: { $in: riskAssessment.indicatorId || [] }
    });

    return indicator ? [indicator] : null;
  },

  async indicator(riskAssessment, {}, { models }: IContext) {
    return riskAssessment.indicatorId
      ? await models.RiskIndicators.findOne({ _id: riskAssessment.indicatorId })
      : null;
  },

  async group(riskAssessment, {}, { models }: IContext) {
    return riskAssessment.groupId
      ? await models.IndicatorsGroups.findOne({ _id: riskAssessment.groupId })
      : null;
  },

  async card(riskAssessment, {}, { subdomain }: IContext) {
    const { cardId, cardType } = riskAssessment;
    if (cardId && cardType) {
      return await sendCardsMessage({
        subdomain,
        action: `${cardType}s.findOne`,
        data: {
          _id: cardId
        },
        isRPC: true,
        defaultValue: {}
      });
    }
    return null;
  }
};
