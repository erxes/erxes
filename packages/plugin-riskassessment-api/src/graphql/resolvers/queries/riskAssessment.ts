import { IContext } from '../../../connectionResolver';
import { requireLogin } from '@erxes/api-utils/src';
import { IRiskAssessmentField } from '../../../models/definitions/common';

const RiskAssessmentQueries = {
  async riskAssesments(_root, params: { categoryId: string } & IRiskAssessmentField, { models }: IContext) {
    return await models.RiskAssessment.riskAssesments(params);
  },

  async riskAssessmentDetail(_root, params: { _id: string }, { models }: IContext) {
    return await models.RiskAssessment.riskAssessmentDetail(params);
  },
};

// requireLogin(RiskAssessmentQueries, 'getRiskAssesment');

export default RiskAssessmentQueries;
