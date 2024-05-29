import { IContext } from '../../../connectionResolver';
import { sendCoreMessage, sendProductsMessage } from '../../../messageBroker';
import { ITimeProportion } from '../../../models/definitions/timeProportions';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.TimeProportions.findOne({ _id });
  },

  async branch(timeProp: ITimeProportion, _, { subdomain }: IContext) {
    if (!timeProp.branchId) {
      return;
    }

    return await sendCoreMessage({
      subdomain,
      action: 'branches.findOne',
      data: { _id: timeProp.branchId },
      isRPC: true
    });
  },

  async department(timeProp: ITimeProportion, _, { subdomain }: IContext) {
    if (!timeProp.departmentId) {
      return;
    }

    return await sendCoreMessage({
      subdomain,
      action: 'departments.findOne',
      data: { _id: timeProp.departmentId },
      isRPC: true
    });
  },

  async productCategory(timeProp: ITimeProportion, _, { subdomain }: IContext) {
    if (!timeProp.productCategoryId) {
      return;
    }

    return await sendProductsMessage({
      subdomain,
      action: 'categories.findOne',
      data: { _id: timeProp.productCategoryId },
      isRPC: true
    });
  }
};
