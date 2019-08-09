import { Products } from '../../../db/models';
import { checkPermission, requireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { paginate } from '../../utils';

const productQueries = {
  /**
   * Products list
   */
  products(
    _root,
    {
      type,
      searchValue,
      ids,
      ...pagintationArgs
    }: { ids: string[]; type: string; searchValue: string; page: number; perPage: number },
    { commonQuerySelector }: IContext,
  ) {
    const filter: any = commonQuerySelector;

    if (type) {
      filter.type = type;
    }

    if (ids) {
      filter._id = { $in: ids };
    }

    // search =========
    if (searchValue) {
      filter.name = new RegExp(`.*${searchValue}.*`, 'i');
    }

    return paginate(Products.find(filter), pagintationArgs);
  },

  /**
   * Get all products count. We will use it in pager
   */
  productsTotalCount(_root, { type }: { type: string }, { commonQuerySelector }: IContext) {
    const filter: any = commonQuerySelector;

    if (type) {
      filter.type = type;
    }

    return Products.find(filter).countDocuments();
  },
};

requireLogin(productQueries, 'productsTotalCount');
checkPermission(productQueries, 'products', 'showProducts', []);

export default productQueries;
