import { IContext } from '../../connectionResolver';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.RiskAssessments.findOne({ _id });
  },
  indicator({ indicatorId }, {}, { models }: IContext) {
    return models.RiskIndicators.findOne({ _id: indicatorId }) || null;
  }
};
