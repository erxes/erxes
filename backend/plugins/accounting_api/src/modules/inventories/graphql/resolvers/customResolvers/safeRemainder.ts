import { ISafeRemainderDocument } from '~/modules/inventories/@types/safeRemainders';

export default {
  async modifiedUser(safeRemainder: ISafeRemainderDocument) {
    return {
      __typename: 'User',
      _id: safeRemainder.modifiedBy,
    };
  },

  async branch(reserveRem: ISafeRemainderDocument) {
    if (!reserveRem.branchId) {
      return;
    }

    return {
      __typename: 'Branch',
      _id: reserveRem.branchId,
    };
  },

  async department(reserveRem: ISafeRemainderDocument) {
    if (!reserveRem.departmentId) {
      return;
    }

    return {
      __typename: 'Department',
      _id: reserveRem.departmentId,
    };
  },

  async productCategory(reserveRem: any) {
    if (!reserveRem.categoryId) {
      return;
    }
    return {
      __typename: 'ProductCategory',
      _id: reserveRem.categoryId,
    };
  },
};
