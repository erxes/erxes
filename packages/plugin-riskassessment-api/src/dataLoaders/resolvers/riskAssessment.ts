import { IContext } from '../../connectionResolver';
import { IRiskAssessmentDocument } from '../../models/definitions/riskassessment';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.RiskAssessment.findOne({ _id });
  },

  async category(riskAssessment: IRiskAssessmentDocument, {}, { dataLoaders }: IContext) {
    return (
      (riskAssessment.categoryId && dataLoaders.categories.load(riskAssessment.categoryId)) || null
    );
  }
};
