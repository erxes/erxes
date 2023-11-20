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
  }
};

export { InsuranceItem };
