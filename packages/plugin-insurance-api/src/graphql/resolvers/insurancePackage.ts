import { IContext } from '../../connectionResolver';
import { IInsurancePackageDocument } from '../../models/definitions/package';

const InsurancePackage = {
  async products(
    insurancePackage: IInsurancePackageDocument,
    _params,
    { models }: IContext
  ) {
    return models.Products.find({ _id: { $in: insurancePackage.productIds } });
  },

  async lastModifiedBy(insurancePackage: IInsurancePackageDocument, _params) {
    return (
      insurancePackage.lastModifiedBy && {
        __typename: 'User',
        _id: insurancePackage.lastModifiedBy
      }
    );
  }
};

export { InsurancePackage };
