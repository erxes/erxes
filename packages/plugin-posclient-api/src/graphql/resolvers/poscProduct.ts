import { IContext } from '../../connectionResolver';
import { customFieldsDataByFieldCode } from '@erxes/api-utils/src/fieldUtils';
import { IProductDocument } from '../../models/definitions/products';
import { getRemBranchId } from '../utils/products';

export default {
  async customFieldsDataByFieldCode(
    product: IProductDocument,
    _,
    { subdomain }: IContext,
  ) {
    return customFieldsDataByFieldCode(product, subdomain);
  },

  unitPrice(product: IProductDocument, _args, { config }: IContext) {
    return product.prices?.[config.token] || 0;
  },

  savedRemainder(product: IProductDocument, args, { config }: IContext) {
    const remBranchId = getRemBranchId(config, args.branchId);
    return product.remainderByToken?.[config.token]?.[remBranchId] || 0;
  },

  isCheckRem(product: IProductDocument, _args, { config }: IContext) {
    return product.isCheckRems?.[config.token] || false;
  },

  async category(product: IProductDocument, _, { models }: IContext) {
    return models.ProductCategories.findOne({ _id: product.categoryId });
  },
};
