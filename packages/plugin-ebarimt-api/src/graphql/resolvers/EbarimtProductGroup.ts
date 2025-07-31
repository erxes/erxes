import { IProductGroupDocument } from '../../models/definitions/productGroup';

const productGroup = {
  async user(productGroup: IProductGroupDocument) {
    if (!productGroup.modifiedBy) {
      return;
    }

    return {
      __typename: 'User',
      _id: productGroup.modifiedBy
    }
  },

  async mainProduct(productGroup: IProductGroupDocument) {
    if (!productGroup.mainProductId) {
      return;
    }

    return {
      __typename: 'Product',
      _id: productGroup.mainProductId
    }
  },

  async subProduct(productGroup: IProductGroupDocument) {
    if (!productGroup.subProductId) {
      return;
    }

    return {
      __typename: 'Product',
      _id: productGroup.subProductId
    }
  },
};

export default productGroup;
