import { paginate } from '@erxes/api-utils/src';
import { IContext, models } from '../../../connectionResolver';
import { generateSort } from '../../../utils';

const generateFilters = params => {
  const filter: any = { status: { $ne: 'archived' } };

  if (params.isArchived) {
    filter.status = 'archived';
  }

  return filter;
};

const RiskAssessmentPlansQueries = {
  async riskAssessmentPlans(_root, args, { models }: IContext) {
    const filter = generateFilters(args);
    const { sortField, sortDirection } = args;
    const sort = generateSort(sortField, sortDirection);

    return paginate(models.Plans.find(filter).sort(sort), args);
  },
  async riskAssessmentPlansTotalCount(_root, args, { models }: IContext) {
    const filter = generateFilters(args);

    return await models.Plans.find(filter).count();
  },
  async riskAssessmentPlan(_root, { _id }, { models }: IContext) {
    return await models.Plans.findOne({ _id });
  },

  async riskAssessmentSchedules(_root, { planId }, { models }: IContext) {
    return await models.Schedules.find({ planId });
  },
  async riskAssessmentSchedulesTotalCount(
    _root,
    { planId },
    { models }: IContext
  ) {
    return await models.Schedules.countDocuments({ planId });
  }
};

export default RiskAssessmentPlansQueries;
