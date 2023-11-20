import { IContext } from '../../connectionResolver';
import { IInsuranceProductDocument } from '../../models/definitions/products';

const InsuranceProduct = {
  async lastModifiedBy(product: IInsuranceProductDocument, _params) {
    return (
      product.lastModifiedBy && {
        __typename: 'User',
        _id: product.lastModifiedBy
      }
    );
  },

  async category(
    product: IInsuranceProductDocument,
    _params,
    { models }: IContext
  ) {
    return models.Categories.findOne({ _id: product.categoryId }).lean();
  }
};

const InsuranceProductOfVendor = {
  async lastModifiedBy(product: IInsuranceProductDocument, _params) {
    return (
      product.lastModifiedBy && {
        __typename: 'User',
        _id: product.lastModifiedBy
      }
    );
  }

  // async risks(
  //   product: IInsuranceProductDocument,
  //   _params,
  //   { models }: IContext
  // ) {
  //   return models.Risks.find({ _id: { $in: product.riskIds || [] } }).lean();
  // }
};

export { InsuranceProduct, InsuranceProductOfVendor };
