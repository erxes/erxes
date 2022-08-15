import { IContext } from '../../../connectionResolver';
import { requireLogin } from '@erxes/api-utils/src';
import { IRiskAssessmentField } from '../../../models/definitions/common';

const RiskAssessmentQueries = {
  async riskAssesments(_root, params: IRiskAssessmentField, { models }: IContext) {
    return await models.RiskAssessment.riskAssesments();
  },
};

// requireLogin(RiskAssessmentQueries, 'getRiskAssesment');

export default RiskAssessmentQueries;
