import { checkPermission } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';

const RiskAssessmentMutations = {
  async addRiskAssessment(_root, params, { models }: IContext) {
    return models.RiskAssessments.addRiskAssessment(params);
  },

  async addBulkRiskAssessment(_root, params, { models }: IContext) {
    return models.RiskAssessments.addBulkRiskAssessment(params);
  },

  async editRiskAssessment(_root, { _id, ...doc }, { models }: IContext) {
    return models.RiskAssessments.editRiskAssessment(_id, doc);
  },
  async removeRiskAssessment(
    _root,
    { riskAssessmentId },
    { models }: IContext
  ) {
    return models.RiskAssessments.removeRiskAssessment(riskAssessmentId);
  }
};

checkPermission(
  RiskAssessmentMutations,
  'addRiskAssessment',
  'manageRiskAssessment'
);
checkPermission(
  RiskAssessmentMutations,
  'editRiskAssessment',
  'manageRiskAssessment'
);
checkPermission(
  RiskAssessmentMutations,
  'removeRiskAssessment',
  'manageRiskAssessment'
);
export default RiskAssessmentMutations;
