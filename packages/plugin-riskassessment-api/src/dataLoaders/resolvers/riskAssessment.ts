import { IContext } from '../../connectionResolver';
import { sendCardsMessage, sendCoreMessage } from '../../messageBroker';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.RiskAssessments.findOne({ _id });
  },

  async branches(riskAssessment, {}, { subdomain }: IContext) {
    return await sendCoreMessage({
      subdomain,
      action: 'branches.find',
      data: {
        query: {
          _id: { $in: riskAssessment.branchIds || [] }
        }
      },
      isRPC: true,
      defaultValue: []
    });
  },

  async departments(riskAssessment, {}, { subdomain }: IContext) {
    return await sendCoreMessage({
      subdomain,
      action: 'departments.find',
      data: { _id: { $in: riskAssessment.departmentIds || [] } },
      isRPC: true,
      defaultValue: []
    });
  },
  async operations(riskAssessment, {}, { models }: IContext) {
    return await models.Operations.find({
      _id: { $in: riskAssessment.operationIds || [] }
    });
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

    return [
      await models.RiskIndicators.findOne({
        _id: { $in: riskAssessment.indicatorId || [] }
      })
    ];
  },

  async card(riskAssessment, {}, { subdomain }: IContext) {
    const { cardId, cardType } = riskAssessment;
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
};
