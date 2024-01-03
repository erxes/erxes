import { IContext } from '../../../connectionResolver';
import { sendCoreMessage, sendProductsMessage } from '../../../messageBroker';
import { IYearPlanDocument } from '../../../models/definitions/yearPlans';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.YearPlans.findOne({ _id });
  },

  async branch(plan: IYearPlanDocument, _, { subdomain }: IContext) {
    if (!plan.branchId) {
      return;
    }

    return await sendCoreMessage({
      subdomain,
      action: 'branches.findOne',
      data: { _id: plan.branchId },
      isRPC: true
    });
  },

  async department(plan: IYearPlanDocument, _, { subdomain }: IContext) {
    if (!plan.departmentId) {
      return;
    }

    return await sendCoreMessage({
      subdomain,
      action: 'departments.findOne',
      data: { _id: plan.departmentId },
      isRPC: true
    });
  },

  async product(plan: IYearPlanDocument, _, { subdomain }: IContext) {
    if (!plan.productId) {
      return;
    }

    return await sendProductsMessage({
      subdomain,
      action: 'findOne',
      data: { _id: plan.productId },
      isRPC: true
    });
  }
};
