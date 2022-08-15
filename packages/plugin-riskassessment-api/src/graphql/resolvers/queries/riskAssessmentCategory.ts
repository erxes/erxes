import { IContext } from '../../../connectionResolver';

const RiskAssesmentsCategoryQueries = {
  async getRiskAssesmentCategory(_root, params, { models }: IContext) {
    return await models.RiskAssessmentCategory.getAssessmentCategory();
  },
};

export default RiskAssesmentsCategoryQueries;
