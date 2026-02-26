import { IContext } from '~/connectionResolvers';
import { IReserveRemDocument } from '~/modules/inventories/@types/reserveRems';

export default {
  async __resolveReference({ _id }, { models }: IContext) {
    return models.ReserveRems.findOne({ _id });
  },

  async branch(reserveRem: IReserveRemDocument) {
    if (!reserveRem.branchId) {
      return;
    }

    return {
      __typename: 'Branch',
      _id: reserveRem.branchId,
    };
  },

  async department(reserveRem: IReserveRemDocument) {
    if (!reserveRem.departmentId) {
      return;
    }

    return {
      __typename: 'Department',
      _id: reserveRem.departmentId,
    };
  },

  async product(reserveRem: IReserveRemDocument) {
    if (!reserveRem.productId) {
      return;
    }

    return {
      __typename: 'Product',
      _id: reserveRem.productId,
    };
  },
};
