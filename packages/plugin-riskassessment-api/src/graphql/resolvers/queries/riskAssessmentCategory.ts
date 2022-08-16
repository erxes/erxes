import { IContext } from '../../../connectionResolver';

const RiskAssesmentsCategoryQueries = {
  async getRiskAssesmentCategories(_root, params, { models }: IContext) {
    return await models.RiskAssessmentCategory.getAssessmentCategories();
  },
  async getRiskAssesmentCategory(_root, _id: string, { models }: IContext) {
    return await models.RiskAssessmentCategory.getAssessmentCategory(_id);
  },
};

export default RiskAssesmentsCategoryQueries;
