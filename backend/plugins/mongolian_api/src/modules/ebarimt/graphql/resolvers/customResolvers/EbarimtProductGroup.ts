import { IProductGroupDocument } from '~/modules/ebarimt/@types';

export default {
  async user(productGroup: IProductGroupDocument) {
    if (!productGroup.modifiedBy) {
      return;
    }

    return {
      __typename: 'User',
      _id: productGroup.modifiedBy,
    };
  },

  mainProduct(productGroup: IProductGroupDocument) {
    if (!productGroup.mainProductId) {
      return null;
    }

    return { __typename: 'Product', _id: productGroup.mainProductId };
  },

  subProduct(productGroup: IProductGroupDocument) {
    if (!productGroup.subProductId) {
      return null;
    }

    return { __typename: 'Product', _id: productGroup.subProductId };
  },
};
