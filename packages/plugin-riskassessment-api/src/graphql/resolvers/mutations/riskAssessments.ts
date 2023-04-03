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
  },
  async removeRiskAssessments(_root, { ids }, { models }: IContext) {
    if (!ids?.length) {
      throw new Error('Please provide some ids');
    }

    try {
      await models.RiksFormSubmissions.deleteMany({
        assessmentId: { $in: ids }
      });
      await models.RiskAssessmentIndicators.deleteMany({
        assessmentId: { $in: ids }
      });
      await models.RiskAssessmentGroups.deleteMany({
        assessmentId: { $in: ids }
      });
      await models.RiskAssessments.deleteMany({ _id: { $in: ids } });
      return 'removed successfully';
    } catch (error) {
      throw new Error(error.message);
    }
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
