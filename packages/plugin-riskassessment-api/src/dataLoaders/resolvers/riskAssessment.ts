import { IContext } from '../../connectionResolver';
import { IRiskAssessmentDocument } from '../../models/definitions/riskassessment';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.RiskAssessment.findOne({ _id });
  },

  async categories(
    riskAssessment: IRiskAssessmentDocument,
    {},
    { dataLoaders }: IContext
  ) {
    return (
      (riskAssessment.categoryIds &&
        dataLoaders.categories.load(riskAssessment.categoryIds)) ||
      null
    );
  }
};
