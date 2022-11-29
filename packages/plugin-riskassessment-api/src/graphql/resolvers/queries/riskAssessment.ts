import { checkPermission } from '@erxes/api-utils/src';
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

  async riskAssessmentDetail(
    _root,
    params: { _id: string; fieldsSkip: any },
    { models }: IContext
  ) {
    return await models.RiskAssessment.riskAssessmentDetail(params);
  }
};

checkPermission(RiskAssessmentQueries, 'riskAssessments', 'showRiskAssessment');
checkPermission(RiskAssessmentQueries, 'riskAssessmentDetail', 'showRiskAssessment');

export default RiskAssessmentQueries;
