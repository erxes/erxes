import { IContext } from '../../../connectionResolver';
import { sendCoreMessage, sendProductsMessage } from '../../../messageBroker';
import { IYearPlanDocument } from '../../../models/definitions/yearPlans';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.YearPlans.findOne({ _id });
  },

  async branch(
    plan: IYearPlanDocument,
    _,
    { dataLoaders, subdomain }: IContext
  ) {
    return await sendCoreMessage({
      subdomain,
      action: 'branches.findOne',
      data: { _id: plan.branchId },
      isRPC: true
    });
  },

  async department(
    plan: IYearPlanDocument,
    _,
    { dataLoaders, subdomain }: IContext
  ) {
    return await sendCoreMessage({
      subdomain,
      action: 'departments.findOne',
      data: { _id: plan.departmentId },
      isRPC: true
    });
  },

  async product(
    plan: IYearPlanDocument,
    _,
    { dataLoaders, subdomain }: IContext
  ) {
    return await sendProductsMessage({
      subdomain,
      action: 'findOne',
      data: { _id: plan.productId },
      isRPC: true
    });
  },

  async uom(plan: IYearPlanDocument, _, { dataLoaders, subdomain }: IContext) {
    return await sendProductsMessage({
      subdomain,
      action: 'uoms.findOne',
      data: { _id: plan.uomId },
      isRPC: true
    });
  }
};
