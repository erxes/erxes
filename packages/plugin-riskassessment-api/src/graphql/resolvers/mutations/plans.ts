import { checkPermission } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { PLAN_STATUSES } from '../../../common/constants';

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

  async duplicateRiskAssessmentPlan(
    _root,
    { _id },
    { models, user }: IContext
  ) {
    return await models.Plans.duplicatePlan(_id, user);
  },

  async changeStatusRiskAssessmentPlan(
    _root,
    { _id, status },
    { models }: IContext
  ) {
    const plan = await models.Plans.findOne({ _id });

    if (!plan) {
      throw new Error('Not Found');
    }

    if (!PLAN_STATUSES[status.toUpperCase()]) {
      throw new Error('Unsupported status');
    }

    return await models.Plans.updateOne(
      { _id: plan._id },
      { $set: { status } }
    );
  },

  async forceStartRiskAssessmentPlan(_root, { _id }, { models }: IContext) {
    return await models.Plans.forceStartPlan(_id);
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
  },

  async bulkUpdateRiskAssessmentSchedule(
    _root,
    { datas },
    { models }: IContext
  ) {
    return await models.Plans.bulkUpdateSchedules(datas);
  }
};

checkPermission(plansMutations, 'addPlan', 'manageRiskAssessment');
checkPermission(plansMutations, 'updatePlan', 'manageRiskAssessment');
checkPermission(plansMutations, 'removePlan', 'manageRiskAssessment');
checkPermission(
  plansMutations,
  'duplicateRiskAssessmentPlan',
  'manageRiskAssessment'
);

export default plansMutations;
