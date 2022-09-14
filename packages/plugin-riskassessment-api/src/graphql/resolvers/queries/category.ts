import { IContext } from '../../../connectionResolver';
import { IRiskAssessmentCategoryField } from '../../../models/definitions/common';

const RiskAssessmentsCategoryQueries = {
  async riskAssesmentCategories(_root, params: IRiskAssessmentCategoryField, { models }: IContext) {
    return await models.RiskAssessmentCategory.getAssessmentCategories(params);
  },
  async riskAssesmentCategory(_root, _id: string, { models }: IContext) {
    return await models.RiskAssessmentCategory.getAssessmentCategory(_id);
  },

  async getRiskAssessmentFormDetail(_root, { _id }, { models }: IContext) {
    return await models.RiskAssessmentCategory.getFormDetail(_id);
  }
};

export default RiskAssessmentsCategoryQueries;
