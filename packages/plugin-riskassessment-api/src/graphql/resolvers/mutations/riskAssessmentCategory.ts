import { IContext } from '../../../connectionResolver';
import { IRiskAssessmentCategoryField } from '../../../models/definitions/common';

const RiskAssessmentCategoryMutation = {
  async addAssessmentCategory(_root, params: IRiskAssessmentCategoryField, { models }: IContext) {
    const result = await models.RiskAssessmentCategory.addAssessmentCategory(params);
    return result;
  },

  async removeAssessmentCategory(_root, params: { _id: string }, { models }: IContext) {
    const result = await models.RiskAssessmentCategory.removeAssessmentCategory(params);
    return result;
  },
};
export default RiskAssessmentCategoryMutation;
