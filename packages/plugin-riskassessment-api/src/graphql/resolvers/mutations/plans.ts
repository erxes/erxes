import { checkPermission } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';

const plansMutations = {
  async addRiskAssessmentPlan(_root, params, { models, user }: IContext) {
    return await models.Plans.addPlan(params, user);
  },

  async updateRiskAssessmentPlan(_root, { _id, ...doc }, { models }: IContext) {
    return await models.Plans.editPlan(_id, doc);
  },
  async removeRiskAssessmentPlan(_root, { ids }, { models }: IContext) {
    return await models.Plans.removePlans(ids);
  },

  async addRiskAssessmentPlanSchedule(
    _root,
    { planId, ...doc },
    { models }: IContext
  ) {
    return await models.Plans.addSchedule(planId, doc);
  },
  async updateRiskAssessmentPlanSchedule(_root, args, { models }: IContext) {
    return await models.Plans.editSchedule(args);
  },
  async removeRiskAssessmentPlanSchedule(_root, { _id }, { models }: IContext) {
    return await models.Plans.removeSchedule(_id);
  }
};

checkPermission(plansMutations, 'addPlan', 'manageRiskAssessment');
checkPermission(plansMutations, 'updatePlan', 'manageRiskAssessment');
checkPermission(plansMutations, 'removePlan', 'manageRiskAssessment');
export default plansMutations;
