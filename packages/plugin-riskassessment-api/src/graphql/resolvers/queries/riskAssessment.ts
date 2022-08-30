import { IContext } from '../../../connectionResolver';
import { IRiskAssessmentField, PaginateField } from '../../../models/definitions/common';

const RiskAssessmentQueries = {
  async riskAssesments(
    _root,
    params: { categoryId: string } & IRiskAssessmentField & PaginateField,
    { models }: IContext
  ) {
    return await models.RiskAssessment.riskAssesments(params);
  },

  async riskAssessmentDetail(_root, params: { _id: string }, { models }: IContext) {
    return await models.RiskAssessment.riskAssessmentDetail(params);
  },
};

// requireLogin(RiskAssessmentQueries, 'getRiskAssesment');

export default RiskAssessmentQueries;
