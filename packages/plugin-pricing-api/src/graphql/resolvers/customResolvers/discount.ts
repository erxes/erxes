import {
  IDiscount,
  IDiscountDocument
} from '../../../models/definitions/discount';

const Discount = {
  createdUser(discount: IDiscountDocument) {
    if (!discount.createdBy) return;

    return {
      __typename: 'User',
      _id: discount.createdBy
    };
  },

  updatedUser(discount: IDiscountDocument) {
    if (!discount.updatedBy) return;

    return {
      __typename: 'User',
      _id: discount.updatedBy
    };
  }
};

export { Discount };
