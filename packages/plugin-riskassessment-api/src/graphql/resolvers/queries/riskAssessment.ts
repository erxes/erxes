import { IContext } from '../../../connectionResolver';
import { IRiskAssessmentField, PaginateField } from '../../../models/definitions/common';

const RiskAssessmentQueries = {
  async riskAssessments(
    _root,
    params: { categoryId: string } & IRiskAssessmentField & PaginateField,
    { models }: IContext
  ) {
    return await models.RiskAssessment.riskAssessments(params);
  },

  async riskAssessmentDetail(_root, params: { _id: string }, { models }: IContext) {
    return await models.RiskAssessment.riskAssessmentDetail(params);
  }
};

export default RiskAssessmentQueries;
