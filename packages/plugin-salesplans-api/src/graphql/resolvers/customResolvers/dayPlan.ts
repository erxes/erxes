import { time } from 'console';
import { IContext } from '../../../connectionResolver';
import { sendCoreMessage, sendProductsMessage } from '../../../messageBroker';
import { IDayPlanDocument } from '../../../models/definitions/dayPlans';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.DayPlans.findOne({ _id });
  },

  async branch(
    plan: IDayPlanDocument,
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
    plan: IDayPlanDocument,
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
    plan: IDayPlanDocument,
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

  async uom(plan: IDayPlanDocument, _, { dataLoaders, subdomain }: IContext) {
    return await sendProductsMessage({
      subdomain,
      action: 'findOneUom',
      data: { _id: plan.uomId },
      isRPC: true
    });
  }

  // async timeFrames(plan: IDayPlanDocument, _, { models }: IContext) {
  //   console.log(plan)
  //   const times = await models.Timeframes.find({
  //     _id: { $in: (plan.values || []).map(t => t.timeId) }
  //   }).lean();

  //   return plan.values.map(p => ({
  //     ...p,
  //     time: times.find(t => t._id === p.timeId)
  //   })).sort((a, b) => a.time.startTime - b.time.startTime);
  // }
};
