import { IContext } from '../../connectionResolver';
import { sendCardsMessage, sendCoreMessage } from '../../messageBroker';
import { IRiskIndicatorsConfigsDocument } from '../../models/definitions/indicator';

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

  async riskIndicator(riskAssessment, {}, { models }: IContext) {
    return await models.RiskIndicators.findOne({
      _id: { $in: riskAssessment.indicatorId || [] }
    });
  }
};
