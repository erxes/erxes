import { checkPermission } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { IRiskAssessmentField } from '../../../models/definitions/common';

const RiskAssessmentMutations = {
  async addRiskAssesment(_root, params: IRiskAssessmentField, { models }: IContext) {
    const result = await models.RiskAssessment.riskAssesmentAdd(params);
    return result;
  },
  async removeRiskAssessment(_root, { _ids }, { models }: IContext) {
    const result = await models.RiskAssessment.riskAssesmentRemove(_ids);
    return result;
  },

  async updateRiskAssessment(
    _root,
    params: { _id: string; doc: IRiskAssessmentField },
    { models }: IContext
  ) {
    const result = await models.RiskAssessment.riskAssessmentUpdate(params);
    return result;
  }
};

checkPermission(RiskAssessmentMutations, 'addRiskAssesment', 'manageRiskAssessment');
checkPermission(RiskAssessmentMutations, 'removeRiskAssessment', 'manageRiskAssessment');
checkPermission(RiskAssessmentMutations, 'updateRiskAssessment', 'manageRiskAssessment');

export default RiskAssessmentMutations;
