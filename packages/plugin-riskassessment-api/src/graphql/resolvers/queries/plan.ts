import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';

const RiskAssessmentPlanQueries = {
  async riskAssessmentPlans(_root, args, { models }: IContext) {
    return paginate(models.Plan.find(), args);
  },
  async riskAssessmentPlansTotalCount(_root, args, { models }: IContext) {
    return await models.Plan.find({}).count();
  },
  async riskAssessmentPlan(_root, { _id }, { models }: IContext) {
    return await models.Plan.findOne({ _id });
  }
};

export default RiskAssessmentPlanQueries;
