import { IContext } from '../../connectionResolver';
import { sendCoreMessage } from '../../messageBroker';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.RiskAssessmentIndicators.findOne({ _id });
  },
  async indicator({ indicatorId }, {}, { models }: IContext) {
    return await models.RiskIndicators.findOne({ _id: indicatorId });
  }
};
