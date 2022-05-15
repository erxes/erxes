import { IContext } from '../../../connectionResolver';

const uomQueries = {
  /**
   * Uoms list
   */
  uoms(_root, _args, { models }: IContext) {
    console.log('here uoms');

    return models.Uoms.find({})
      .sort({ order: 1 })
      .lean();
  },

  /**
   * Get all uoms count. We will use it in pager
   */
  uomsTotalCount(_root, _args, { models }: IContext) {
    return models.Uoms.find({}).countDocuments();
  }
};

// requireLogin(productQueries, 'productsTotalCount');
// checkPermission(productQueries, 'products', 'showProducts', []);
// checkPermission(productQueries, 'productCategories', 'showProducts', []);
// checkPermission(productQueries, 'productCountByTags', 'showProducts', []);

export default uomQueries;
