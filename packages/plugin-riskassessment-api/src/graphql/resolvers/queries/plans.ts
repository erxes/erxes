import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';

const RiskAssessmentPlansQueries = {
  async riskAssessmentPlans(_root, args, { models }: IContext) {
    return paginate(models.Plans.find(), args);
  },
  async riskAssessmentPlansTotalCount(_root, args, { models }: IContext) {
    return await models.Plans.find({}).count();
  },
  async riskAssessmentPlan(_root, { _id }, { models }: IContext) {
    return await models.Plans.findOne({ _id });
  }
};

export default RiskAssessmentPlansQueries;
