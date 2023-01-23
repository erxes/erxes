import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';

const uomQueries = {
  /**
   * Uoms list
   */
  uoms(_root, _args, { models }: IContext) {
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

checkPermission(uomQueries, 'uoms', 'showProducts', []);
checkPermission(uomQueries, 'uomsTotalCount', 'showProducts', []);

export default uomQueries;
