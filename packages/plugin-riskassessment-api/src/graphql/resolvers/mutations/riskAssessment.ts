import { IContext } from '../../../connectionResolver';
import { requireLogin } from '@erxes/api-utils/src';
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
  },
};

// requireLogin(RiskAssessmentMutations,'addRiskAssesment')

export default RiskAssessmentMutations;
