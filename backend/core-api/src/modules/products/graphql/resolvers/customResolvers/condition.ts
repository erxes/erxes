import { IProductConditionDocument } from '@/products/@types/condition';
import { PRODUCT_STATUSES } from '@/products/constants';
import { IContext } from '~/connectionResolvers';

export default {
  // Shown before a code change, which leaves these products on the old code.
  async productCount(
    condition: IProductConditionDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    return models.Products.countDocuments({
      conditionCodes: condition.code,
      status: { $ne: PRODUCT_STATUSES.DELETED },
    });
  },
};
