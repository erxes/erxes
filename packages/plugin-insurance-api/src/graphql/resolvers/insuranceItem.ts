import { IContext } from '../../connectionResolver';
import { IInsuranceItem } from '../../models/definitions/item';

const InsuranceItem = {
  async deal(item: IInsuranceItem, _params, { models }: IContext) {
    return (
      item.dealId && {
        __typename: 'Deal',
        _id: item.dealId
      }
    );
  },

  async vendorUser(item: IInsuranceItem, _params, { models }: IContext) {
    return (
      item.vendorUserId && {
        __typename: 'ClientPortalUser',
        _id: item.vendorUserId
      }
    );
  },

  async product(item: IInsuranceItem, _params, { models }: IContext) {
    return models.Products.findOne({ _id: item.productId });
  },

  async customer(item: IInsuranceItem, _params) {
    if (item.customerId) {
      return { __typename: 'Customer', _id: item.customerId };
    }

    return null;
  },

  async company(item: IInsuranceItem, _params, { models }: IContext) {
    if (item.companyId) {
      return { __typename: 'Company', _id: item.companyId };
    }
  }
};

export { InsuranceItem };
