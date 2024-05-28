import { IContext } from '../../../connectionResolver';
import {
  IInsuranceProduct,
  IInsuranceProductDocument
} from '../../../models/definitions/products';

const mutations = {
  insuranceProductsAdd: async (
    _root,
    doc: IInsuranceProduct,
    { models, user }: IContext
  ) => {
    return models.Products.createProduct(doc, user ? user._id : '');
  },

  insuranceProductsEdit: async (
    _root,
    doc: IInsuranceProductDocument,
    { models, user }: IContext
  ) => {
    return models.Products.updateProduct(doc, user._id);
  },

  insuranceProductsRemove: async (_root, { _id }, { models }: IContext) => {
    await models.Products.remove({ _id });
    return 'removed';
  }
};

export default mutations;
