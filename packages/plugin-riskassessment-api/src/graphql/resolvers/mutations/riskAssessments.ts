import { IContext } from '../../../connectionResolver';

const RiskAssessmentMutations = {
  async addRiskAssessment(_root, params, { models }: IContext) {
    return models.RiskAssessments.addRiskAssessment(params);
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

export default RiskAssessmentMutations;
