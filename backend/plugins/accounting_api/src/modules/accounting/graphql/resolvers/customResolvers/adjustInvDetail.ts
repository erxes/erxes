import { IContext } from "~/connectionResolvers";
import { IAdjustInvDetail } from "~/modules/accounting/@types/adjustInventory";

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.AdjustInvDetails.findOne({ _id });
  },

  async account(detail: IAdjustInvDetail, _, { models }: IContext) {
    return await models.Accounts.getAccount({ _id: detail.accountId });
  },

  async product(detail: IAdjustInvDetail) {
    if (!detail.productId) {
      return;
    }

    return {
      __typename: 'Product',
      _id: detail.productId,
    };
  },

  async branch(detail: IAdjustInvDetail) {
    if (!detail.branchId) {
      return;
    }

    return {
      __typename: 'Branch',
      _id: detail.branchId,
    };
  },

  async department(detail: IAdjustInvDetail) {
    if (!detail.departmentId) {
      return;
    }

    return {
      __typename: 'Department',
      _id: detail.departmentId,
    };
  },
};
